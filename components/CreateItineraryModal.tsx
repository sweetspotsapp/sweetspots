import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { X, Plus, Mail, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SavedPlace, ItineraryPlace, TripSummary } from '@/types/Place';
import { createItinerary } from '@/utils/storage';
import { PlaceScheduleCard } from './PlaceScheduleCard';
import { TripSummaryCard } from './TripSummaryCard';
import { SSText } from './ui/SSText';
import { PickerProvider, SSDatePicker } from './ui/SSDateTimePicker';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface CreateItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  selectedPlaces: SavedPlace[];
}

export function CreateItineraryModal({ 
  visible, 
  onClose, 
  onCreated, 
  selectedPlaces 
}: CreateItineraryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [itineraryPlaces, setItineraryPlaces] = useState<ItineraryPlace[]>([]);
  const [tripSummary, setTripSummary] = useState<TripSummary>({
    totalCost: 0,
    totalDuration: 0,
    totalDays: 0,
    averageCostPerDay: 0,
    placesPerDay: 0,
  });

  useEffect(() => {
    if (selectedPlaces.length > 0) {
      const places: ItineraryPlace[] = selectedPlaces.map((place, index) => ({
        ...place,
        order: index + 1,
        visitDuration: getDefaultDuration(place.category),
        estimatedCost: getDefaultCost(place.priceRange),
        visitDate: '',
        visitTime: '',
        notes: '',
      }));
      setItineraryPlaces(places);
    }
  }, [selectedPlaces]);

  useEffect(() => {
    calculateTripSummary();
  }, [itineraryPlaces, startDate, endDate]);

  const getDefaultDuration = (category: string): number => {
    const durations: { [key: string]: number } = {
      'café': 1.5,
      'restaurant': 2,
      'outdoor': 3,
      'nightlife': 3,
      'market': 2,
      'museum': 2.5,
      'shopping': 2,
      'attraction': 2,
    };
    return durations[category] || 2;
  };

  const getDefaultCost = (priceRange: string): number => {
    const costs: { [key: string]: number } = {
      'Free': 0,
      '$': 25,
      '$$': 50,
      '$$$': 100,
      '$$$$': 200,
    };
    return costs[priceRange] || 50;
  };

  const calculateTripSummary = () => {
    const totalCost = itineraryPlaces.reduce((sum, place) => sum + (place.estimatedCost || 0), 0);
    const totalDuration = itineraryPlaces.reduce((sum, place) => sum + (place.visitDuration || 0), 0);

    let totalDays = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

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
    setItineraryPlaces(prev => 
      prev.map(place => 
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
      order: index + 1,
    }));

    setItineraryPlaces(reorderedPlaces);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for your itinerary.');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Missing dates', 'Please select start and end dates for your trip.');
      return;
    }

    try {
      await createItinerary({
        name: name.trim(),
        description: description.trim(),
        places: itineraryPlaces,
        collaborators,
        isPublic,
        startDate,
        endDate,
        totalEstimatedCost: tripSummary.totalCost,
        totalDuration: tripSummary.totalDuration,
      });

      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setCollaborators([]);
      setNewCollaborator('');
      setIsPublic(false);
      setItineraryPlaces([]);

      onCreated();
    } catch (error) {
      Alert.alert('Error', 'Failed to create itinerary. Please try again.');
    }
  };

  const addCollaborator = () => {
    if (newCollaborator.trim() && !collaborators.includes(newCollaborator.trim())) {
      setCollaborators([...collaborators, newCollaborator.trim()]);
      setNewCollaborator('');
    }
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c !== email));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <PickerProvider>
        <View className="flex-1">
          <LinearGradient colors={["#f0fdf4", "#ffffff"]} className="absolute inset-0" />

          <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-slate-100">
            <SSText variant="bold" className="text-2xl text-gray-800">Create Itinerary</SSText>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center">
              <X size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            <View className="mb-8 mt-4">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-2">Trip Details</SSText>

              <View className="mb-4">
                <Label htmlFor='trip-name'>Trip Name *</Label>
                <Input
                  placeholder="e.g., Weekend Adventure in SF"
                  id='trip-name'
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="mb-4">
                <SSText variant="semibold" className="text-base text-gray-800 mb-2">Description</SSText>
                <Input
                  className="h-20"
                  placeholder="Tell us about your trip..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <SSText variant="semibold" className="text-base text-gray-800 mb-2">Start Date *</SSText>
                  <SSDatePicker id='start-date' value={startDate} onChange={setStartDate} />
                </View>
                <View className="flex-1">
                  <SSText variant="semibold" className="text-base text-gray-800 mb-2">End Date *</SSText>
                  <SSDatePicker id='end-date' value={endDate} onChange={setEndDate} />
                </View>
              </View>
            </View>

            <TripSummaryCard summary={tripSummary} />

            <View className="mb-8">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-2">Places Schedule ({itineraryPlaces.length} places)</SSText>
              <SSText className="text-sm text-slate-500 mb-4">Configure when and how long you'll visit each place</SSText>

              {itineraryPlaces.map((place, index) => (
                <PlaceScheduleCard
                  key={place.id}
                  place={place}
                  onUpdate={(updates) => updatePlace(place.id, updates)}
                  onMoveUp={index > 0 ? () => reorderPlaces(index, index - 1) : undefined}
                  onMoveDown={index < itineraryPlaces.length - 1 ? () => reorderPlaces(index, index + 1) : undefined}
                />
              ))}
            </View>

            <View className="mb-8">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-4">Invite Collaborators</SSText>
              <View className="flex-row gap-2 mb-4">
                <Input
                  placeholder="Enter email or phone"
                  value={newCollaborator}
                  onChangeText={setNewCollaborator}
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  className="w-12 h-12 bg-emerald-50 border border-emerald-600 rounded-xl justify-center items-center"
                  onPress={addCollaborator}>
                  <Plus size={20} color="#10b981" />
                </TouchableOpacity>
              </View>

              {collaborators.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {collaborators.map((collaborator, index) => (
                    <View key={index} className="flex-row items-center bg-emerald-50 border border-emerald-600 px-3 py-1.5 rounded-2xl gap-1.5">
                      {collaborator.includes('@') ? (
                        <Mail size={14} color="#10b981" />
                      ) : (
                        <Phone size={14} color="#10b981" />
                      )}
                      <SSText variant="medium" className="text-xs text-emerald-600">{collaborator}</SSText>
                      <TouchableOpacity onPress={() => removeCollaborator(collaborator)}>
                        <X size={14} color="#f43f5e" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className="mb-8">
              <TouchableOpacity className="flex-row items-start gap-3" onPress={() => setIsPublic(!isPublic)}>
                <View className={`w-5 h-5 rounded-full border-2 justify-center items-center mt-0.5 ${isPublic ? 'border-emerald-600' : 'border-slate-200'}`}>
                  {isPublic && <View className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                </View>
                <View className="flex-1">
                  <SSText variant="medium" className="text-base text-gray-800 mb-1">Make this itinerary public</SSText>
                  <SSText className="text-sm text-slate-500">Others can discover and view your itinerary</SSText>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View className="flex-row px-5 pb-10 pt-5 gap-3 bg-white border-t border-slate-100">
            <Button variant='outline' onPress={onClose}>
              <SSText>Cancel</SSText>
            </Button>
            <Button onPress={handleCreate}>
              <SSText >Create Itinerary</SSText>
            </Button>
          </View>
        </View>
      </PickerProvider>
    </Modal>
  );
}
