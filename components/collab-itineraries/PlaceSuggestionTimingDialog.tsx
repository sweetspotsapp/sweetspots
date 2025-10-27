import React, { useEffect, useState, useCallback } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { SSText } from '../ui/SSText';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import {
  bulkUpdateItineraryPlaces,
  getAllItineraryPlaces,
} from '@/endpoints/itinerary-places/endpoints';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';
import SuggestionTimingCard from './SuggestionTimingCard';
import {
  computeGapAfterMap,
  rebuildTimesKeepingGivenGaps,
} from '../itineraries/ItineraryForm';
import { arrayMove } from '@/lib/utils';

import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import SSSlider from '../ui/SSSlider';
import moment from 'moment';
import { Button } from '../ui/button';
import { UpdateItineraryPlaceDto } from '@/dto/itinerary-places/update-itinerary-place.dto';
import { router } from 'expo-router';

export default function PlaceSuggestionTimingDialog({
  open,
  onOpenChange,
  itineraryId,
  itineraryPlace,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryId: string;
  itineraryPlace: IItineraryPlace;
}) {
  const [originalItineraryPlaces, setOriginalItineraryPlaces] = useState<
    IItineraryPlace[]
  >([]);
  const [itineraryPlaces, setItineraryPlaces] = useState<IItineraryPlace[]>([]);
  const [duration, setDuration] = useState<number>(2);

  const onDurationChange = useCallback(
    (newHours: number) => {
      setDuration(newHours);
      setItineraryPlaces((prev) => {
        if (!prev.length) return prev;

        // Preserve current gaps (with default final gap)
        const gapBefore = computeGapAfterMap(prev);

        // Apply new duration to the newly-added place (identified by id)
        const after = prev.map((p) =>
          p.id === itineraryPlace.id ? { ...p, visitDuration: newHours } : p
        );

        // Rebuild times with original gaps
        return rebuildTimesKeepingGivenGaps(after, gapBefore);
      });
    },
    [itineraryPlace.id]
  );

  const reorderPlaces = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      const before = itineraryPlaces;
      const gapBefore = computeGapAfterMap(before);

      let after = arrayMove(before, fromIndex, toIndex);

      after = after.map((p, i) => ({ ...p, orderIndex: i }));

      after = rebuildTimesKeepingGivenGaps(after, gapBefore);

      setItineraryPlaces(after);
    },
    [itineraryPlaces]
  );

  useEffect(() => {
    getAllItineraryPlaces({
      itineraryId,
      limit: 100,
      page: 1,
      suggestionStatus: ItineraryPlaceSuggestionStatus.Accepted,
    }).then((res) => {
      if (res.success && res.data) {
        const acceptedItineraryPlaces = res.data?.data || [];
        const lastAcceptedPlace =
          acceptedItineraryPlaces[acceptedItineraryPlaces.length - 1];
        const lastVisitDate = lastAcceptedPlace?.visitDate;
        const lastVisitTime = lastAcceptedPlace?.visitTime;
        const lastVisitDuration = lastAcceptedPlace?.visitDuration || 0;
        const newPlaceVisitTime =
          lastVisitTime && lastVisitDate
            ? moment(`${lastVisitDate}T${lastVisitTime}`)
                .add(15, 'minutes')
                .add(lastVisitDuration, 'hour')
                .format('HH:mm')
            : '09:00';
        const itineraryPlacesWithNew = acceptedItineraryPlaces.concat([
          {
            ...itineraryPlace,
            visitTime: newPlaceVisitTime,
            visitDate: lastVisitDate,
          },
        ]);
        setOriginalItineraryPlaces(itineraryPlacesWithNew);
        setItineraryPlaces(itineraryPlacesWithNew);
      }
    });
  }, [itineraryId]);

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<IItineraryPlace>) => {
      const index = getIndex ? getIndex() : 0;
      const isNew = item.id === itineraryPlace.id;
      return (
        <ScaleDecorator>
          <View className="pb-3">
            <SuggestionTimingCard
              index={index}
              itineraryPlace={{
                ...item,
                visitDuration: isNew ? duration : item.visitDuration,
              }}
              // Make the whole card draggable on long-press:
              onLongPress={drag}
              isDraggable={isNew}
              isActive={isActive}
              // If your card shows manual arrows, you can hide them now or keep as fallback:
            />
          </View>
        </ScaleDecorator>
      );
    },
    [duration]
  );

  const [isConfirming, setIsConfirming] = useState(false);

  function handleConfirm() {
    const updatedItineraryPlaces = itineraryPlaces
      .filter((place) => {
        const original = originalItineraryPlaces.find((o) => o.id === place.id);
        if (!original) return true; // newly added place

        return (
          original.visitDate !== place.visitDate ||
          original.visitTime !== place.visitTime ||
          Number(original.visitDuration) !== Number(place.visitDuration) ||
          original.orderIndex !== place.orderIndex
        );
      })
      .map((place) => ({
        ...place,
        suggestionStatus: ItineraryPlaceSuggestionStatus.Accepted,
      }));

    const updateDtos: UpdateItineraryPlaceDto[] = updatedItineraryPlaces.map(
      (place) => ({
        itineraryPlaceId: place.id,
        visitDate: place.visitDate,
        visitTime: place.visitTime,
        visitDuration: place.visitDuration,
        orderIndex: place.orderIndex,
        suggestionStatus: ItineraryPlaceSuggestionStatus.Accepted,
      })
    );

    bulkUpdateItineraryPlaces(updateDtos)
      .then((res) => {
        router.replace(`/itineraries/${itineraryId}`);
      })
      .finally(() => {
        setIsConfirming(false);
      });
  }

  const { height } = useWindowDimensions();
  const MAX_DIALOG_BODY = Math.round(height * 0.75);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-2xl"
        // Bound the dialog content so children can scroll
        style={{ maxHeight: MAX_DIALOG_BODY }}
      >
        {isConfirming ? (
          <SSText>Saving changes...</SSText>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                <SSText className="text-center font-semibold !text-lg">
                  When do you want to go and for how long?
                </SSText>
              </DialogTitle>
            </DialogHeader>

            <SSSlider
              minimumValue={0.5}
              maximumValue={8}
              value={duration}
              onValueChange={onDurationChange}
              step={0.5}
            />
            <View className="flex-row justify-between mt-1">
              <SSText className="text-xs text-slate-500">30min</SSText>
              <SSText className="text-xs text-slate-500">8h</SSText>
            </View>
            <View>
              <SSText className="text-sm text-muted-foreground">
                Long-press the new spot and drag it to reposition it in the
                itinerary.
              </SSText>
            </View>
            <View className="mt-2 flex-1 min-h-0 overflow-y-scroll">
              <DraggableFlatList
                data={itineraryPlaces}
                keyExtractor={(ip) => String(ip.id)}
                renderItem={renderItem}
                activationDistance={8}
                onDragEnd={({ from, to }) => reorderPlaces(from, to)}
                // IMPORTANT: make the list fill the available space and be scrollable
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: 4, paddingBottom: 16 }}
                // If DialogContent internally scrolls (e.g., wraps with ScrollView),
                // enable nested scrolling so gestures propagate correctly.
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                className='flex-1'
              />
            </View>

            <Button onPress={handleConfirm} className="mt-3">
              <SSText>Confirm</SSText>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
