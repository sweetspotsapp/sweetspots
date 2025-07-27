import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { X, Plus, Mail, User } from 'lucide-react-native';
import { ItineraryPlace, TripSummary } from '@/types/Place';

import {
  createItinerary,
  getItineraryById,
  updateItinerary,
} from '@/api/itineraries/endpoints';
import { calculateTimeAndDistance } from '@/api/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { useItinerarySocket } from '@/hooks/useItinerarySocket';
import { useAuth } from '@/hooks/useAuth';
import moment from 'moment';
import AddPlaceToItineraryModal from './AddPlaceToItineraryModal';
import { IItineraryPlace } from '@/dto/itineraries/itinerary.dto';
import { IPlace } from '@/dto/places/place.dto';
import { PlaceScheduleCard } from '../PlaceScheduleCard';
import { TripSummaryCard } from '../TripSummaryCard';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PickerProvider } from '../ui/SSDateTimePicker';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';

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

  const [isAddingPlace, setIsAddingPlace] = useState(false);

  const [name, setName] = useState('');
  const [nameInput, setNameInput] = useState('');

  const [description, setDescription] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [itineraryPlaces, setItineraryPlaces] = useState<IItineraryPlace[]>([]);
  const [tripSummary, setTripSummary] = useState<TripSummary>({
    totalCost: 0,
    totalDuration: 0,
    totalDays: 0,
    averageCostPerDay: 0,
    placesPerDay: 0,
  });
  const [travelSegments, setTravelSegments] = useState<
    { fromIndex: number; toIndex: number; distance: number; duration: number }[]
  >([]);

  const { user } = useAuth();

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
            const newFields = { ...prev };
            delete newFields[field];
            return newFields;
          });
        },
        suggestedChange: (data) => {
          const { field, value, userId } = data;
          if (user?.uid !== userId) {
            if (field === 'name') {
              setName(value);
            } else if (field === 'description') {
              setDescription(value);
            } else {
              const [fieldName, index] = field.split('.');
              const placeIndex = parseInt(index, 10) - 1;
              setItineraryPlaces((prev) =>
                prev.map((place, i) =>
                  i === placeIndex ? { ...place, [fieldName]: value } : place
                )
              );
            }
          }
        },
      },
    });

  useEffect(() => {
    if (itineraryId) {
      // Load existing itinerary data if editing
      const fetchItinerary = async () => {
        try {
          const response = await getItineraryById(itineraryId);
          const data = response.data;
          if (data) {
            setName(data.name);
            if (data.description) setDescription(data.description);
            // if (data.startDate) setStartDate(data.startDate);
            // if (data.endDate) setEndDate(data.endDate);
            setCollaborators(data.collaborators || []);
            setIsPublic(data.isPublic || false);
            setItineraryPlaces(data.itineraryPlaces || []);
          }
        } catch (error) {
          console.error('Failed to load itinerary data', error);
        }
      };
      fetchItinerary();
    }
  }, [itineraryId]);

  useEffect(() => {
    if (selectedPlaces.length > 0) {
      const places: IItineraryPlace[] = selectedPlaces.map((place, index) => ({
        id: place.id, // Use the place id or generate a unique id if needed
        createdAt: new Date().toISOString(),
        place,
        imageUrl: place.images?.[0]?.url || null, // Use the first image URL if available
        visitDuration: getDefaultDuration(place.category),
        estimatedCost: getDefaultCost(place.priceRange),
        visitDate: '',
        visitTime: '',
        notes: '',
        orderIndex: index + 1,
      }));
      setItineraryPlaces(places);
    }
  }, [selectedPlaces]);

  useEffect(() => {
    const run = async () => {
      await calculateTripSummary();
    };
    run();
  }, [itineraryPlaces]);

  const getDefaultDuration = (category: string): number => {
    const durations: { [key: string]: number } = {
      café: 1.5,
      restaurant: 2,
      outdoor: 3,
      nightlife: 3,
      market: 2,
      museum: 2.5,
      shopping: 2,
      attraction: 2,
    };
    return durations[category] || 2;
  };

  const getDefaultCost = (priceRange: string): number => {
    const costs: { [key: string]: number } = {
      Free: 0,
      $: 25,
      $$: 50,
      $$$: 100,
      $$$$: 200,
    };
    return costs[priceRange] || 50;
  };

  const calculateTripDistanceAndDuration = async () => {
    const { location } = useLocationStore.getState();

    if (location && itineraryPlaces.length > 0) {
      const userLocation = {
        latitude: Number(location.latitude) || 0,
        longitude: Number(location.longitude) || 0,
      };

      // Calculate Euclidean distance (rough estimate)
      const vectorDistance = (
        a: { latitude: number; longitude: number },
        b: { latitude: number; longitude: number }
      ) => {
        const dx = a.latitude - b.latitude;
        const dy = a.longitude - b.longitude;
        return Math.sqrt(dx * dx + dy * dy);
      };

      const sortedPlaces = [...itineraryPlaces].sort(
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

      // Travel from point[i] to point[i+1]
      let segments: typeof travelSegments = [];

      for (let i = 0; i < waypoints.length - 1; i++) {
        try {
          const result = await calculateTimeAndDistance({
            origin: waypoints[i],
            destination: waypoints[i + 1],
          });

          if (result?.data?.duration && result?.data?.distance) {
            segments.push({
              fromIndex: i - 1, // -1 means from user location
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
    }
  };

  useEffect(() => {
    calculateTripDistanceAndDuration();
  }, [itineraryPlaces.map((p) => p.id).join('-')]);

  const calculateTripSummary = async () => {
    const totalCost = itineraryPlaces.reduce(
      (sum, place) => sum + (place.estimatedCost || 0),
      0
    );
    const totalVisitDuration = itineraryPlaces.reduce(
      (sum, place) => sum + (place.visitDuration || 0),
      0
    );

    let totalTravelDuration =
      travelSegments.reduce(
        (sum, segment) => sum + (segment.duration || 0),
        0
      ) / 3600;

    // let totalDays = 0;
    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);
    //   totalDays =
    //     Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
    //     1;
    // }

    const totalDuration = totalVisitDuration + totalTravelDuration;
    const totalDays = totalDuration > 0 ? Math.ceil(totalDuration / 24) : 0;
    const averageCostPerDay = totalDays > 0 ? totalCost / totalDays : 0;
    const placesPerDay = totalDays > 0 ? itineraryPlaces.length / totalDays : 0;

    setTripSummary({
      totalCost,
      totalDuration,
      totalDays,
      averageCostPerDay,
      placesPerDay,
    });
  };

  const updatePlace = (placeId: string, updates: Partial<ItineraryPlace>) => {
    setItineraryPlaces((prev) =>
      prev.map((place) =>
        place.id === placeId ? { ...place, ...updates } : place
      )
    );
  };

  const reorderPlaces = (fromIndex: number, toIndex: number) => {
    const newPlaces = [...itineraryPlaces];
    const [movedPlace] = newPlaces.splice(fromIndex, 1);
    newPlaces.splice(toIndex, 0, movedPlace);

    const reorderedPlaces = newPlaces.map((place, index) => ({
      ...place,
      orderIndex: index + 1,
    }));

    setItineraryPlaces(reorderedPlaces);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for your itinerary.');
      return;
    }

    // if (!startDate || !endDate) {
    //   Alert.alert(
    //     'Missing dates',
    //     'Please select start and end dates for your trip.'
    //   );
    //   return;
    // }

    const itineraryPlacesSorted = [...itineraryPlaces].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const startDate = itineraryPlacesSorted[0]?.visitDate || undefined;
    const lastPlace = itineraryPlacesSorted[itineraryPlacesSorted.length - 1];
    const endDate = lastPlace
      ? moment(lastPlace?.visitDate)
          .add(lastPlace.visitDuration, 'hours')
          .toISOString()
      : undefined;

    try {
      const payload = {
        name: (nameInput || name).trim(),
        description: (descriptionInput || description).trim(),
        places: itineraryPlaces.map((place) => ({
          placeId: place.placeId || place.id,
          visitDate: place.visitDate ?? undefined,
          visitTime: place.visitTime ?? undefined,
          visitDuration: place.visitDuration || 0,
          estimatedCost: place.estimatedCost || 0,
          notes: place.notes || '',
          orderIndex: place.orderIndex,
        })),
        collaborators,
        isPublic,
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

      setName('');
      setDescription('');
      // setStartDate('');
      // setEndDate('');
      setCollaborators([]);
      setNewCollaborator('');
      setIsPublic(false);
      setItineraryPlaces([]);

    } catch (error) {
      console.error('Failed to create itinerary', error);
      Alert.alert('Error', 'Failed to create itinerary. Please try again.');
    }
  };

  const addCollaborator = () => {
    if (
      newCollaborator.trim() &&
      !collaborators.includes(newCollaborator.trim())
    ) {
      setCollaborators([...collaborators, newCollaborator.trim()]);
      setNewCollaborator('');
    }
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
  };

  const [lockedFields, setLockedFields] = useState<{ [key: string]: string }>(
    {}
  );
  const userLockedFields = Object.keys(lockedFields).filter(
    (field) => lockedFields[field] !== user?.uid
  );

  const handleFieldFocus = (field: string) => {
    if (itineraryId && user?.uid) {
      startEditing(field);
    }
  };

  const handleFieldBlur = (field: string, prevValue: any, newValue: any) => {
    if (itineraryId && user?.uid) {
      stopEditing(field);
      if (newValue !== prevValue) {
        logChange(field, newValue);
        suggestChange(field, newValue);
        if (field === 'name') setNameInput(newValue);
        if (field === 'description') setDescriptionInput(newValue);
      }
    }
  };

  return (
    <PickerProvider>
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-slate-100">
          <SSText variant="bold" className="text-2xl text-gray-800">
            {editMode ? 'Edit' : 'Create'} Itinerary
          </SSText>
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center"
            >
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8 mt-4">
            <SSText variant="semibold" className="text-xl text-gray-800 mb-2">
              Trip Details
            </SSText>

            <View className="mb-4">
              <Label htmlFor="trip-name">Trip Name *</Label>
              <Input
                placeholder="e.g., Weekend Adventure in SF"
                id="trip-name"
                value={name}
                onChangeText={setName}
                onFocus={() => handleFieldFocus('name')}
                onBlur={() => handleFieldBlur('name', nameInput, name)}
                editable={!userLockedFields.includes('name')}
              />
            </View>

            <View className="mb-4">
              <SSText
                variant="semibold"
                className="text-base text-gray-800 mb-2"
              >
                Description
              </SSText>
              <Input
                className="h-20"
                placeholder="Tell us about your trip..."
                value={description}
                onChangeText={setDescription}
                onFocus={() => handleFieldFocus('description')}
                onBlur={() =>
                  handleFieldBlur('description', descriptionInput, description)
                }
                multiline
                numberOfLines={3}
                editable={!userLockedFields.includes('description')}
              />
            </View>

            {/* <View className="flex-row gap-3">
              <View className="flex-1">
                <SSText
                  variant="semibold"
                  className="text-base text-gray-800 mb-2"
                >
                  Start Date *
                </SSText>
                <SSDatePicker
                  id="start-date"
                  value={startDate}
                  onChange={setStartDate}
                />
              </View>
              <View className="flex-1">
                <SSText
                  variant="semibold"
                  className="text-base text-gray-800 mb-2"
                >
                  End Date *
                </SSText>
                <SSDatePicker
                  id="end-date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </View>
            </View> */}
          </View>

          <TripSummaryCard summary={tripSummary} />

          <View className="mb-8">
            <View className="md:flex-row md:items-end justify-between mb-4">
              <View>
                <SSText
                  variant="semibold"
                  className="text-xl text-gray-800 mb-2"
                >
                  Places Schedule ({itineraryPlaces.length} places)
                </SSText>
                <SSText className="text-sm text-slate-500">
                  Press each place to configure when and how long you'll visit
                </SSText>
              </View>
              <Button onPress={() => setIsAddingPlace(true)} className='mt-2'>
                <Plus size={16} color="white" />
                <SSText>Add Place</SSText>
              </Button>
            </View>

            {itineraryPlaces.map((place, index) => (
              <PlaceScheduleCard
                key={place.id}
                itineraryPlace={place}
                onUpdate={(updates) => updatePlace(place.id, updates)}
                onMoveUp={
                  index > 0 ? () => reorderPlaces(index, index - 1) : undefined
                }
                onMoveDown={
                  index < itineraryPlaces.length - 1
                    ? () => reorderPlaces(index, index + 1)
                    : undefined
                }
                toNextSegment={travelSegments[index]}
                onFieldFocus={handleFieldFocus}
                onFieldBlur={handleFieldBlur}
                lockedFields={lockedFields}
              />
            ))}
          </View>

          <View className="mb-8">
            <SSText variant="semibold" className="text-xl text-gray-800 mb-4">
              Invite Collaborators
            </SSText>
            <View className="flex-row gap-2 mb-4">
              <Input
                placeholder="Enter email or username"
                className="flex-1"
                value={newCollaborator}
                onChangeText={setNewCollaborator}
                keyboardType="email-address"
              />
              <TouchableOpacity
                className="w-12 h-12 bg-emerald-50 border border-emerald-600 rounded-xl justify-center items-center"
                onPress={addCollaborator}
              >
                <Plus size={20} color="#10b981" />
              </TouchableOpacity>
            </View>

            {collaborators.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {collaborators.map((collaborator, index) => (
                  <View
                    key={index}
                    className="flex-row items-center bg-emerald-50 border border-emerald-600 px-3 py-1.5 rounded-2xl gap-1.5"
                  >
                    {collaborator.includes('@') ? (
                      <Mail size={14} color="#10b981" />
                    ) : (
                      <User size={14} color="#10b981" />
                    )}
                    <SSText
                      variant="medium"
                      className="text-xs text-emerald-600"
                    >
                      {collaborator}
                    </SSText>
                    <TouchableOpacity
                      onPress={() => removeCollaborator(collaborator)}
                    >
                      <X size={14} color="#f43f5e" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="mb-8">
            <TouchableOpacity
              className="flex-row items-start gap-3"
              onPress={() => setIsPublic(!isPublic)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 justify-center items-center mt-0.5 ${
                  isPublic ? 'border-emerald-600' : 'border-slate-200'
                }`}
              >
                {isPublic && (
                  <View className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
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
        </ScrollView>

        <View className="flex-row px-5 pb-10 pt-5 gap-3 bg-white border-t border-slate-100">
          <Button variant="outline" onPress={onCancel}>
            <SSText>Cancel</SSText>
          </Button>
          <Button onPress={handleCreate} className="flex-1">
            <SSText>{editMode ? 'Save Changes' : 'Create Itinerary'}</SSText>
          </Button>
        </View>
      </View>

      <AddPlaceToItineraryModal
        itineraryPlaceIds={itineraryPlaces.map((p) => p.placeId).filter(Boolean) as string[]}
        visible={isAddingPlace}
        onClose={() => setIsAddingPlace(false)}
        onAdded={(places) => {
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
            orderIndex: itineraryPlaces.length + index + 1,
          }));
          console.log('Adding new places:', places, newPlaces);
          setItineraryPlaces((prev) => [...prev, ...newPlaces]);
          setIsAddingPlace(false);
        }}
      />
    </PickerProvider>
  );
}
