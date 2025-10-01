import React, { useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { ItineraryPlace, TripSummary } from '@/types/Place';
import {
  createItinerary,
  getItineraryById,
  updateItinerary,
} from '@/endpoints/itineraries/endpoints';
import { calculateTimeAndDistance } from '@/endpoints/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { useItinerarySocket } from '@/hooks/useItinerarySocket';
import { useAuth } from '@/hooks/useAuth';

import AddPlaceToItineraryModal from './AddPlaceToItineraryModal';
import { IPlace } from '@/dto/places/place.dto';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { PlaceScheduleCard } from '../PlaceScheduleCard';
import { TripSummaryCard } from '../TripSummaryCard';

import { Label } from '../ui/label';
import { PickerProvider } from '../ui/SSDateTimePicker';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { SSControlledInput } from '../ui/SSControlledInput';

import { updateSuggestionStatus } from '@/endpoints/collab-itinerary/endpoints';
import SuggestionCardList, { Suggestion } from './SuggestionCardList';
import { CreateItineraryDto } from '@/dto/itineraries/create-itinerary.dto';

// ------------------ helpers: default cost/duration ------------------

function getStartOrNow(p: IItineraryPlace) {
  return parseStart(p.visitDate, p.visitTime) || moment();
}

const getDefaultDuration = (category?: string): number => {
  const durations: Record<string, number> = {
    café: 1.5,
    restaurant: 2,
    outdoor: 3,
    nightlife: 3,
    market: 2,
    museum: 2.5,
    shopping: 2,
    attraction: 2,
  };
  return (category && durations[category]) || 2;
};

const getDefaultCost = (priceRange?: string): number => {
  const costs: Record<string, number> = {
    Free: 0,
    $: 25,
    $$: 50,
    $$$: 100,
    $$$$: 200,
  };
  return (priceRange && costs[priceRange]) || 50;
};

// parse/format datetimes for places
function parseStart(visitDate?: string, visitTime?: string) {
  if (!visitDate && !visitTime) return null;

  // If visitDate looks ISO, prefer that
  if (visitDate && visitDate.includes('T')) {
    const m = moment(visitDate, moment.ISO_8601, true);
    return m.isValid() ? m : null;
    // If it contains ISO and a separate visitTime is also set, we still prefer the ISO
  }
  const datePart = visitDate || moment().format(DATE_FMT);
  const timePart = visitTime || '00:00';
  const m = moment(`${datePart} ${timePart}`, `${DATE_FMT} ${TIME_FMT}`, true);
  return m.isValid() ? m : null;
}

function formatDate(m: moment.Moment | null) {
  return m ? m.format(DATE_FMT) : '';
}
function formatTime(m: moment.Moment | null) {
  return m ? m.format(TIME_FMT) : '';
}

// Build per-place "gapAfter" based on current order
const computeGapAfterMap = (list: IItineraryPlace[]) => {
  const gapAfter = new Map<string, number>();
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    const aStart = parseStart(a.visitDate, a.visitTime);
    const aEnd = aStart
      ? aStart.clone().add(Number(a.visitDuration) || 0, 'hours')
      : null;
    const bStart = parseStart(b.visitDate, b.visitTime);
    const gap = aEnd && bStart ? bStart.valueOf() - aEnd.valueOf() : 0;
    gapAfter.set(a.id, gap);
  }
  if (list[list.length - 1]) gapAfter.set(list[list.length - 1].id, 0);
  return gapAfter;
};

const startKey = (p?: IItineraryPlace) => {
  if (!p) return null;
  const m = parseStart(p.visitDate, p.visitTime);
  return m ? m.toISOString() : null; // canonical key
};

// Rebuild chain after reorder, keeping each place's original gapAfter
const rebuildTimesKeepingGivenGaps = (
  list: IItineraryPlace[],
  gapAfter: Map<string, number>
) => {
  if (!list.length) return list;

  const chain = [...list].sort(
    (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
  );
  const first = chain[0];
  let cursorStart = parseStart(first.visitDate, first.visitTime) || moment();

  chain[0] = {
    ...first,
    visitDate: formatDate(cursorStart),
    visitTime: formatTime(cursorStart),
  };

  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1];
    const prevStart =
      parseStart(prev.visitDate, prev.visitTime) || cursorStart.clone();
    const prevEnd = prevStart
      .clone()
      .add(Number(prev.visitDuration) || 0, 'hours');

    const prevGap = gapAfter.get(prev.id) ?? 0;
    const nextStart = prevEnd.clone().add(prevGap, 'ms');

    chain[i] = {
      ...chain[i],
      visitDate: formatDate(nextStart),
      visitTime: formatTime(nextStart),
    };

    cursorStart = nextStart;
  }

  return chain;
};

// Move one element in an array
function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// ------------------ RHF schema & types ------------------

const DATE_FMT = 'YYYY-MM-DD';
const TIME_FMT = 'HH:mm';

const placeSchema = yup.object({
  id: yup.string().required(),
  // These two may be empty until user sets them
  visitDate: yup.string().default(''),
  visitTime: yup.string().default(''),
  visitDuration: yup
    .number()
    .typeError('Visit duration must be a number')
    .min(0, 'Visit duration cannot be negative')
    .default(0),
  estimatedCost: yup
    .number()
    .typeError('Estimated cost must be a number')
    .min(0)
    .default(0),
  notes: yup.string().notRequired().nullable(),
  orderIndex: yup.number().integer().min(1).required(),
  // we keep the full place object for coords/prices
  place: yup.mixed().optional(),
  imageUrl: yup.string().nullable(),
  suggestionStatus: yup.mixed<'pending' | 'accepted' | 'rejected'>().optional(),
});

const formSchema = yup.object({
  name: yup
    .string()
    .required('Trip name is required')
    .max(120, 'Name is too long'),
  description: yup
    .string()
    .max(1000, 'Description is too long')
    .nullable()
    .optional(),
  isPublic: yup.boolean().default(false),
  collaborators: yup
    .array()
    .of(yup.string().email('Invalid email').required())
    .default([]),
  itineraryPlaces: yup.array().of(placeSchema).min(0).required(),
});

type Override<T, R> = Omit<T, keyof R> & R;

// 2) Infer from your Yup schemas
type InferredPlace = yup.InferType<typeof placeSchema>;
type InferredForm = yup.InferType<typeof formSchema>;

// 3) Strengthen the 'place' field to use your domain model
export type ItineraryPlaceForm = Override<
  InferredPlace,
  {
    place?: IPlace | null;
  }
>;

// 4) Strengthen the form's itineraryPlaces array to use the strengthened item type
export type FormValues = Override<
  InferredForm,
  {
    itineraryPlaces: ItineraryPlaceForm[];
  }
>;

interface ItineraryFormProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  selectedPlaces?: IPlace[];
  onCancel?: () => void;
  itineraryId?: string;
}

export function ItineraryForm({
  onCreated,
  onCancel,
  onUpdated,
  selectedPlaces = [],
  itineraryId,
}: ItineraryFormProps) {
  const editMode = Boolean(itineraryId);
  const { user } = useAuth();
  const isMounted = useRef(false);

  // ------------------ local UI state not in form ------------------
  const [nameSuggestions, setNameSuggestions] = React.useState<Suggestion[]>(
    []
  );
  const [descriptionSuggestions, setDescriptionSuggestions] = React.useState<
    Suggestion[]
  >([]);
  const [isAddingPlace, setIsAddingPlace] = React.useState(false);
  const [ownerUserId, setOwnerUserId] = React.useState<string | null>(null);

  const [travelSegments, setTravelSegments] = React.useState<
    { fromIndex: number; toIndex: number; distance: number; duration: number }[]
  >([]);

  const [timeConflicts, setTimeConflicts] = React.useState<Set<string>>(
    new Set()
  );

  const [tripSummary, setTripSummary] = React.useState<TripSummary>({
    totalCost: 0,
    totalDuration: 0,
    totalDays: 0,
    averageCostPerDay: 0,
    placesPerDay: 0,
    minEstimatedCost: 0,
    maxEstimatedCost: 0,
  });

  const isOwner = user?.uid === ownerUserId;

  // ------------------ RHF init ------------------
  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      collaborators: [],
      itineraryPlaces: [],
    },
    mode: 'onBlur',
  });

  const itineraryPlaces = watch('itineraryPlaces') as IItineraryPlace[];
  const isPublic = watch('isPublic');
  const collaborators = watch('collaborators') as string[];

  useEffect(() => {
    const list = (getValues('itineraryPlaces') || []) as IItineraryPlace[];

    // map: startKey -> indices[]
    const seen = new Map<string, number[]>();
    list.forEach((p, i) => {
      const k = startKey(p);
      if (!k) return; // ignore unset times
      const arr = seen.get(k) || [];
      arr.push(i);
      seen.set(k, arr);
    });

    // which indices are duplicated?
    const dupIdxs = new Set<number>();
    for (const arr of seen.values()) {
      if (arr.length > 1) arr.forEach((i) => dupIdxs.add(i));
    }

    // clear all field errors first
    list.forEach((_, i) => {
      clearErrors(`itineraryPlaces.${i}.visitDate`);
      clearErrors(`itineraryPlaces.${i}.visitTime`);
    });

    // set per-item error for duplicates
    dupIdxs.forEach((i) => {
      setError(`itineraryPlaces.${i}.visitTime`, {
        type: 'validate',
        message: 'Same start time as another place',
      });
    });

    // keep easy lookup by place.id for rendering
    const ids = new Set<string>();
    dupIdxs.forEach((i) => {
      const p = list[i];
      if (p?.id) ids.add(p.id);
    });
    setTimeConflicts(ids);
  }, [itineraryPlaces, getValues]);

  // ------------------ sockets (locking/suggestions) ------------------
  const [lockedFields, setLockedFields] = React.useState<{
    [key: string]: string;
  }>({});
  const userLockedFields = Object.keys(lockedFields).filter(
    (f) => lockedFields[f] !== user?.uid
  );

  const { startEditing, stopEditing, suggestChange, logChange } =
    useItinerarySocket({
      itineraryId: itineraryId || '',
      userId: user?.uid || '',
      onEvents: {
        fieldLocked: ({ field, userId }) => {
          setLockedFields((prev) => ({ ...prev, [field]: userId }));
        },
        fieldUnlocked: ({ field }) => {
          setLockedFields((prev) => {
            const n = { ...prev };
            delete n[field];
            return n;
          });
        },
        suggestedChange: (data) => {
          const { field, value, userId: uid, id } = data;
          if (user?.uid !== uid) {
            if (field === 'name') {
              setNameSuggestions((prev) => [...prev, { id, uid, value }]);
            } else if (field === 'description') {
              setDescriptionSuggestions((prev) => [
                ...prev,
                { id, uid, value },
              ]);
            } else {
              // expect "fieldName.index"
              const [fieldName, indexStr] = String(field).split('.');
              const index = parseInt(indexStr, 10) - 1;
              const list = getValues('itineraryPlaces');
              if (!list || index < 0 || index >= list.length) return;

              const updated = [...list];
              // @ts-expect-error dynamic write
              updated[index][fieldName] = value;
              setValue('itineraryPlaces', updated, {
                shouldDirty: true,
                shouldValidate: false,
              });
            }
          }
        },
      },
    });

  const handleFieldFocus = (field: string) => {
    if (itineraryId && user?.uid) startEditing(field);
  };

  const handleFieldBlur = (field: string, prevValue: any, newValue: any) => {
    if (itineraryId && user?.uid) {
      stopEditing(field);
      if (newValue !== prevValue) {
        logChange(field, newValue);
        suggestChange(field, newValue);
      }
    }
  };

  // ------------------ data loading ------------------

  // fetch & prime form when editing
  useEffect(() => {
    isMounted.current = true;
    if (!itineraryId) return;

    (async () => {
      try {
        const res = await getItineraryById(itineraryId);
        const data = res.data;
        if (!data) return;

        setOwnerUserId(data.userId || null);

        const mapped = (data.itineraryPlaces || []).map(
          (p: IItineraryPlace) => ({
            ...p,
            orderIndex: p.orderIndex ?? 0,
            visitDuration: Number(p.visitDuration) || 0,
            visitDate: typeof p.visitDate === 'string' ? p.visitDate : '',
            visitTime: typeof p.visitTime === 'string' ? p.visitTime : '',
            estimatedCost:
              typeof p.estimatedCost === 'number' && !isNaN(p.estimatedCost)
                ? p.estimatedCost
                : 0,
            notes: p.notes || '',
          })
        );

        reset({
          name: data.name || '',
          description: data.description || '',
          isPublic: Boolean(data.isPublic),
          collaborators: (data.collaborators || []).map((c: any) =>
            typeof c === 'string' ? c : ''
          ),
          itineraryPlaces: mapped.sort(
            (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
          ),
        });
      } catch (e) {
        console.error('Failed to load itinerary', e);
      }
    })();

    return () => {
      isMounted.current = false;
    };
  }, [itineraryId, reset]);

  // seed selectedPlaces on first mount if creating
  useEffect(() => {
    if (!selectedPlaces?.length || editMode) return;
    const places: IItineraryPlace[] = selectedPlaces.map((place, index) => ({
      id: place.id,
      createdAt: new Date().toISOString(),
      place,
      imageUrl: place.images?.[0]?.url || null,
      visitDuration: getDefaultDuration(place.category),
      estimatedCost: getDefaultCost(place.priceRange),
      visitDate: '',
      visitTime: '',
      notes: '',
      orderIndex: index + 1,
      suggestionStatus: 'accepted',
    }));
    setValue('itineraryPlaces', places, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [selectedPlaces, editMode, setValue]);

  // ------------------ travel segments & summary ------------------
  const calculateTripDistanceAndDuration = React.useCallback(async () => {
    const list = getValues('itineraryPlaces') as IItineraryPlace[];
    const { location } = useLocationStore.getState();

    if (location && list && list.length > 0) {
      const userLocation = {
        latitude: Number(location.latitude) || 0,
        longitude: Number(location.longitude) || 0,
      };

      const vectorDistance = (
        a: { latitude: number; longitude: number },
        b: { latitude: number; longitude: number }
      ) => {
        const dx = a.latitude - b.latitude;
        const dy = a.longitude - b.longitude;
        return Math.sqrt(dx * dx + dy * dy);
      };

      const sortedPlaces = [...list].sort(
        (a, b) =>
          vectorDistance(userLocation, {
            latitude: Number(a.place?.latitude) || 0,
            longitude: Number(a.place?.longitude) || 0,
          }) -
          vectorDistance(userLocation, {
            latitude: Number(b.place?.latitude) || 0,
            longitude: Number(b.place?.longitude) || 0,
          })
      );

      const waypoints = [
        userLocation,
        ...sortedPlaces.map((p) => ({
          latitude: Number(p.place?.latitude) || 0,
          longitude: Number(p.place?.longitude) || 0,
        })),
      ];

      const segments: typeof travelSegments = [];
      for (let i = 0; i < waypoints.length - 1; i++) {
        try {
          const result = await calculateTimeAndDistance({
            origin: waypoints[i],
            destination: waypoints[i + 1],
          });
          if (result?.data?.duration && result?.data?.distance) {
            segments.push({
              fromIndex: i - 1,
              toIndex: i,
              distance: result.data.distance,
              duration: result.data.duration,
            });
          }
        } catch (err) {
          console.error(
            `Error calculating travel time between stop ${i} and ${i + 1}`,
            err
          );
        }
      }
      setTravelSegments(segments);
    } else {
      setTravelSegments([]);
    }
  }, [getValues]);

  const calculateTripSummary = React.useCallback(() => {
    const list = getValues('itineraryPlaces') as IItineraryPlace[];
    const totalCost = list.reduce(
      (sum, p) => sum + (p.place ? p.place?.maxPrice || 0 : 0),
      0
    );
    const minEstimatedCost = list.reduce(
      (sum, p) => sum + (p.place ? p.place?.minPrice || 0 : 0),
      0
    );
    const maxEstimatedCost = list.reduce(
      (sum, p) => sum + (p.place ? p.place?.maxPrice || 0 : 0),
      0
    );
    const totalVisitDuration = list.reduce(
      (sum, p) => sum + (Number(p.visitDuration) || 0),
      0
    );

    const totalTravelDuration =
      travelSegments.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600;

    const totalDuration = totalVisitDuration + totalTravelDuration;
    const totalDays = totalDuration > 0 ? Math.ceil(totalDuration / 24) : 0;
    const averageCostPerDay = totalDays > 0 ? totalCost / totalDays : 0;
    const placesPerDay = totalDays > 0 ? list.length / totalDays : 0;

    setTripSummary({
      totalCost,
      totalDuration,
      totalDays,
      averageCostPerDay,
      placesPerDay,
      minEstimatedCost,
      maxEstimatedCost,
    });
  }, [getValues, travelSegments]);

  // Recompute travel when order/coords change
  useEffect(() => {
    const key = JSON.stringify(
      (itineraryPlaces || []).map((p) => ({
        id: p.id,
        orderIndex: p.orderIndex,
        lat: Number(p.place?.latitude) || 0,
        lng: Number(p.place?.longitude) || 0,
      }))
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = key; // explicit usage to satisfy lints
    calculateTripDistanceAndDuration();
  }, [itineraryPlaces, calculateTripDistanceAndDuration]);

  // Recompute summary when times/durations/order or segments change
  useEffect(() => {
    const key = JSON.stringify(
      (itineraryPlaces || []).map((p) => ({
        id: p.id,
        orderIndex: p.orderIndex,
        visitDate: p.visitDate,
        visitTime: p.visitTime,
        visitDuration: p.visitDuration,
        estimatedCost: p.estimatedCost,
        minPrice: p.place?.minPrice,
        maxPrice: p.place?.maxPrice,
      }))
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = key;
    calculateTripSummary();
  }, [itineraryPlaces, travelSegments, calculateTripSummary]);

  // ------------------ propagation & reorder time logic ------------------

  // Shift all following places by the edited end-time delta
  const updatePlaceWithPropagation = (
    placeId: string,
    updates: Partial<ItineraryPlace>
  ) => {
    const list = getValues('itineraryPlaces') as IItineraryPlace[];
    const idx = list.findIndex((p) => p.id === placeId);
    if (idx === -1) return;

    const current = list[idx];
    const oldStart = parseStart(current.visitDate, current.visitTime);
    const oldDurationHrs = Number(current.visitDuration) || 0;
    const oldEnd = oldStart
      ? oldStart.clone().add(oldDurationHrs, 'hours')
      : null;

    const nextDurationHrs =
      updates.visitDuration !== undefined
        ? Number(updates.visitDuration) || 0
        : oldDurationHrs;

    const now = moment();
    const newVisitDate =
      updates.visitDate !== undefined
        ? updates.visitDate
        : current.visitDate
        ? current.visitDate
        : now.format(DATE_FMT);
    const newVisitTime =
      updates.visitTime !== undefined
        ? updates.visitTime
        : current.visitTime
        ? current.visitTime
        : now.format(TIME_FMT);

    const newStart = parseStart(newVisitDate, newVisitTime) || oldStart;
    const newEnd = newStart
      ? newStart.clone().add(nextDurationHrs, 'hours')
      : oldEnd;

    // 1) Apply patch to the edited item
    let next = list.map((p, i) =>
      i === idx
        ? {
            ...p,
            ...updates,
            visitDate: newVisitDate,
            visitTime: newVisitTime,
            visitDuration: nextDurationHrs,
          }
        : p
    );

    // 2) Forward-shift the rest to preserve the edited place's gap to its successor
    const durationChanged = updates.visitDuration !== undefined;
    if (oldEnd && newEnd && durationChanged) {
      const deltaMs = newEnd.valueOf() - oldEnd.valueOf();
      if (deltaMs !== 0) {
        for (let i = idx + 1; i < next.length; i++) {
          const p = next[i];
          const start = parseStart(p.visitDate, p.visitTime);
          if (!start) continue;
          const shifted = start.clone().add(deltaMs, 'ms');
          next[i] = {
            ...p,
            visitDate: formatDate(shifted),
            visitTime: formatTime(shifted),
          };
        }
      }
    }

    // 3) Auto-reposition the edited item if its start crosses neighbors
    const edited = next[idx];
    const editedStart = getStartOrNow(edited);

    // Find the index where this item should live by chronological start
    // (stable: only move the edited item)
    let target = idx;

    // Move left while it starts before previous
    while (target > 0) {
      const prev = next[target - 1];
      const prevStart = getStartOrNow(prev);
      if (editedStart.isBefore(prevStart)) {
        target -= 1;
      } else break;
    }

    // Move right while it starts after next
    while (target < next.length - 1) {
      const nextItem = next[target + 1];
      const nextStart = getStartOrNow(nextItem);
      if (editedStart.isAfter(nextStart)) {
        target += 1;
      } else break;
    }

    if (target !== idx) {
      // Move just the edited item; do not touch others' timestamps
      next = arrayMove(next, idx, target);

      // Renumber orderIndex after the move
      next = next.map((p, i) => ({ ...p, orderIndex: i + 1 }));

      // next = rebuildTimesKeepingGivenGaps(next, gapBeforeReorder);
    } else {
      next = next.map((p, i) => ({ ...p, orderIndex: i + 1 }));
    }

    setValue('itineraryPlaces', next, { shouldDirty: true });
  };

  // Public wrapper for PlaceScheduleCard to call
  const updatePlace = (placeId: string, updates: Partial<ItineraryPlace>) => {
    updatePlaceWithPropagation(placeId, updates);
    // Validate changed fields lightly
    void trigger('itineraryPlaces');
  };

  const reorderPlaces = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const before = getValues('itineraryPlaces') as IItineraryPlace[];
    const gapBefore = computeGapAfterMap(before);

    // Reorder
    let after = arrayMove(before, fromIndex, toIndex);

    // Renumber
    after = after.map((p, i) => ({ ...p, orderIndex: i + 1 }));

    // Rebuild times keeping the old gaps
    after = rebuildTimesKeepingGivenGaps(after, gapBefore);

    setValue('itineraryPlaces', after, { shouldDirty: true });
  };

  // ------------------ suggestions accept/reject ------------------

  const handleAcceptRejectPlaceSuggestion = (
    suggestionId: string,
    status: 'accepted' | 'rejected'
  ) => {
    const list = getValues('itineraryPlaces') as IItineraryPlace[];
    const idx = list.findIndex((p) => p.id === suggestionId);
    if (idx === -1) return;
    const target = list[idx];
    if (target.suggestionStatus !== 'pending') return;

    // update backend
    updateSuggestionStatus(suggestionId, status);

    // update form list
    const next = [...list];
    next[idx] = { ...target, suggestionStatus: status };
    setValue('itineraryPlaces', next, { shouldDirty: true });
  };

  // ------------------ create/save ------------------

  const onSubmit = async (values: FormValues) => {
    if (!values.name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for your itinerary.');
      return;
    }

    const itineraryPlacesSorted = [...values.itineraryPlaces].sort(
      (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
    );
    const first = itineraryPlacesSorted[0];
    const startDate = first?.visitDate || undefined;
    const last = itineraryPlacesSorted[itineraryPlacesSorted.length - 1];

    const lastStart = parseStart(last?.visitDate, last?.visitTime);
    const endDate =
      last && lastStart
        ? lastStart
            .clone()
            .add(Number(last.visitDuration) || 0, 'hours')
            .toISOString()
        : undefined;

    try {
      const payload: CreateItineraryDto = {
        name: values.name.trim(),
        description: (values.description || '').trim(),
        itineraryPlaces: values.itineraryPlaces.map((p) => ({
          placeId: (p as any).placeId || p.id,
          visitDate: p.visitDate || undefined,
          visitTime: p.visitTime || undefined,
          visitDuration: Number(p.visitDuration) || 0,
          estimatedCost: Number(p.estimatedCost) || 0,
          notes: p.notes || '',
          orderIndex: p.orderIndex,
        })),
        collaborators: values.collaborators || [],
        isPublic: values.isPublic || false,
        startDate,
        endDate,
      };

      if (editMode && itineraryId) {
        await updateItinerary(itineraryId, payload);
        onUpdated?.();
      } else {
        await createItinerary(payload);
        onCreated?.();
      }

      reset({
        name: '',
        description: '',
        isPublic: false,
        collaborators: [],
        itineraryPlaces: [],
      });
    } catch (error) {
      console.error('Failed to create/update itinerary', error);
      Alert.alert('Error', 'Failed to save itinerary. Please try again.');
    }
  };

  // ------------------ collaborators helpers ------------------

  const [newCollaborator, setNewCollaborator] = React.useState('');
  const addCollaborator = () => {
    const v = newCollaborator.trim();
    if (!v) return;
    if ((collaborators || []).includes(v)) {
      setNewCollaborator('');
      return;
    }
    setValue('collaborators', [...(collaborators || []), v], {
      shouldDirty: true,
    });
    setNewCollaborator('');
  };
  const removeCollaborator = (email: string) => {
    setValue(
      'collaborators',
      (collaborators || []).filter((c) => c !== email),
      { shouldDirty: true }
    );
  };

  // ------------------ render ------------------

  const acceptedPlaces = useMemo(
    () =>
      (itineraryPlaces || []).filter(
        (p) => p.suggestionStatus === 'accepted' || !p.suggestionStatus
      ),
    [itineraryPlaces]
  );
  const suggestedPlaces = useMemo(
    () =>
      (itineraryPlaces || []).filter((p) => p.suggestionStatus === 'pending'),
    [itineraryPlaces]
  );

  return (
    <PickerProvider>
      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="mb-8 mt-4">
            <SSText variant="semibold" className="text-xl text-gray-800 mb-2">
              Trip Details
            </SSText>

            <View className="mb-4">
              <Label htmlFor="trip-name">Trip Name *</Label>
              <SSControlledInput
                control={control}
                name="name"
                placeholder="e.g., Weekend Adventure in SF"
                // lock awareness
                readOnly={userLockedFields.includes('name')}
                onFocus={() => handleFieldFocus('name')}
                onBlur={(e) => {
                  const prev = ''; // previous suggestion text not stored here; socket change logs handle it
                  const now = getValues('name');
                  handleFieldBlur('name', prev, now);
                }}
                error={errors.name?.message}
              />
            </View>

            <SuggestionCardList
              suggestions={nameSuggestions}
              title="Name Suggestions"
              onSuggestionStatusChange={handleAcceptRejectPlaceSuggestion}
            />

            <View className="mb-4">
              <SSText
                variant="semibold"
                className="text-base text-gray-800 mb-2"
              >
                Description
              </SSText>
              <SSControlledInput
                control={control}
                name="description"
                placeholder="Tell us about your trip..."
                multiline
                numberOfLines={3}
                readOnly={userLockedFields.includes('description')}
                onFocus={() => handleFieldFocus('description')}
                onBlur={(e) => {
                  const prev = '';
                  const now = getValues('description');
                  handleFieldBlur('description', prev, now);
                }}
                error={errors.description?.message as string | undefined}
              />
            </View>
          </View>

          <TripSummaryCard summary={tripSummary} />

          <View className="my-8">
            <View className="md:flex-row md:items-end justify-between mb-4">
              <View>
                <SSText
                  variant="semibold"
                  className="text-xl text-gray-800 mb-2"
                >
                  Places Schedule ({acceptedPlaces.length} places)
                </SSText>
                <SSText className="text-sm text-slate-500">
                  Tap each place to configure when and how long you&apos;ll
                  visit
                </SSText>
                {timeConflicts.size > 0 && (
                  <View className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 mt-2">
                    <SSText className="text-red-700">
                      {timeConflicts.size} place
                      {timeConflicts.size > 1 ? 's' : ''} share the same start
                      time. Adjust times so each place starts at a unique time.
                    </SSText>
                  </View>
                )}
              </View>
              <Button onPress={() => setIsAddingPlace(true)} className="mt-2">
                <Plus size={16} color="white" />
                <SSText>Add Place</SSText>
              </Button>
            </View>

            {acceptedPlaces.map((place, index) => (
              <PlaceScheduleCard
                index={index}
                key={place.id}
                conflict={timeConflicts.has(place.id)}
                itineraryPlace={place}
                onUpdate={(updates) => updatePlace(place.id, updates)}
                onMoveUp={
                  index > 0 ? () => reorderPlaces(index, index - 1) : undefined
                }
                onMoveDown={
                  index < acceptedPlaces.length - 1
                    ? () => reorderPlaces(index, index + 1)
                    : undefined
                }
                toNextSegment={travelSegments[index]}
                onFieldFocus={handleFieldFocus}
                onFieldBlur={handleFieldBlur}
                lockedFields={lockedFields}
              />
            ))}

            {suggestedPlaces.length > 0 && (
              <>
                <SSText
                  variant="semibold"
                  className="text-xl text-gray-800 mb-2 mt-6"
                >
                  Suggested Places ({suggestedPlaces.length} places)
                </SSText>
                <SSText className="text-sm text-slate-500 mb-6">
                  Tap each place to configure when and how long you&apos;ll
                  visit
                </SSText>
                {suggestedPlaces.map((place) => (
                  <PlaceScheduleCard
                    key={place.id}
                    itineraryPlace={place}
                    onUpdate={(updates) => updatePlace(place.id, updates)}
                    onFieldFocus={handleFieldFocus}
                    onFieldBlur={handleFieldBlur}
                    lockedFields={lockedFields}
                    onAcceptSuggestion={() =>
                      handleAcceptRejectPlaceSuggestion(place.id, 'accepted')
                    }
                    onRejectSuggestion={() =>
                      handleAcceptRejectPlaceSuggestion(place.id, 'rejected')
                    }
                  />
                ))}
              </>
            )}
          </View>

          {!editMode && (
            <View className="mb-8">
              <TouchableOpacity
                className="flex-row items-start gap-3"
                onPress={() =>
                  setValue('isPublic', !isPublic, { shouldDirty: true })
                }
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 justify-center items-center mt-0.5 ${
                    isPublic ? 'border-orange-600' : 'border-slate-200'
                  }`}
                >
                  {isPublic && (
                    <View className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  )}
                </View>
                <View className="flex-1">
                  <SSText
                    variant="medium"
                    className="text-base text-gray-800 mb-1"
                  >
                    Make this itinerary public
                  </SSText>
                  <SSText className="text-sm text-slate-500">
                    Others can discover and view your itinerary
                  </SSText>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View className="flex-row pb-10 pt-5 gap-3 bg-white border-t border-slate-100">
          <Button variant="outline" onPress={onCancel}>
            <SSText>Cancel</SSText>
          </Button>
          <Button
            onPress={handleSubmit((e: any) => onSubmit(e))}
            disabled={isSubmitting || timeConflicts.size > 0}
            className="flex-1"
          >
            <SSText>{editMode ? 'Save Changes' : 'Create Itinerary'}</SSText>
          </Button>
        </View>
      </View>

      {/* Add Place Modal */}
      <AddPlaceToItineraryModal
        itineraryPlaceIds={
          (itineraryPlaces || [])
            .map((p) => (p as any).placeId || p.id)
            .filter(Boolean) as string[]
        }
        visible={isAddingPlace}
        onClose={() => setIsAddingPlace(false)}
        onAdded={(places) => {
          const startLen = (getValues('itineraryPlaces') || []).length;
          const newPlaces = places.map((place, index) => ({
            id: place.id,
            createdAt: new Date().toISOString(),
            place,
            imageUrl: place.images?.[0]?.url || null,
            visitDuration: getDefaultDuration(place.category),
            estimatedCost: getDefaultCost(place.priceRange),
            visitDate: '',
            visitTime: '',
            notes: '',
            orderIndex: startLen + index + 1,
            suggestionStatus: 'accepted' as const,
          }));
          setValue(
            'itineraryPlaces',
            [...(getValues('itineraryPlaces') || []), ...newPlaces],
            {
              shouldDirty: true,
            }
          );
          setIsAddingPlace(false);
        }}
      />
    </PickerProvider>
  );
}
