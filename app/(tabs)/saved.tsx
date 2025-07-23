import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, Plus } from 'lucide-react-native';

import { CreateItineraryModal } from '@/components/CreateItineraryModal';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { Button } from '@/components/ui/button';
import { Toast } from 'toastify-react-native';
import SavedPlaces from '@/components/SavedPlaces';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';

export default function SavedTab() {
  const { savedPlaces } = useSavedPlaces();
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    const count = selectedPlaceIds.length
    setSelectedCount(count);
  }, [selectedPlaceIds]);

  const handleSelectPlace = (placeId: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedPlaceIds([]);
    }
  };

  const handleCreateItinerary = () => {
    if (selectedCount === 0) {
      Alert.alert(
        'No places selected',
        'Please select at least one place to create an itinerary.'
      );
      return;
    }
    setShowCreateModal(true);
  };

  const onItineraryCreated = () => {
    Toast.success('Itinerary created successfully!');
    setShowCreateModal(false);
    setIsSelectionMode(false);
    setSelectedPlaceIds([]);
  };

  return (
    <SafeAreaView className="flex-1">
      <SSLinearGradient />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
        <SSText variant="bold" className="text-3xl text-emerald-600">
          Saved Places
        </SSText>
        <TouchableOpacity
          className={`w-11 h-11 rounded-full justify-center items-center ${
            isSelectionMode
              ? 'bg-emerald-600'
              : 'bg-white border-2 border-emerald-600'
          }`}
          onPress={toggleSelectionMode}
        >
          <CheckCircle
            size={24}
            color={isSelectionMode ? '#ffffff' : '#10b981'}
          />
        </TouchableOpacity>
      </View>

      <SavedPlaces
        isSelectionMode={isSelectionMode}
        onSelectPlace={handleSelectPlace}
        selectedPlaceIds={selectedPlaceIds}
      />

      {/* Floating Create Button */}
      {selectedCount > 0 && (
        <Button
          className="absolute bottom-7 left-5 right-5 shadow-lg"
          onPress={handleCreateItinerary}
        >
          <Plus size={24} color="#ffffff" />
          <SSText variant="semibold" className="text-white text-base">
            Create Itinerary ({selectedCount})
          </SSText>
        </Button>
      )}

      <CreateItineraryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={onItineraryCreated}
        selectedPlaces={savedPlaces.filter((p) => selectedPlaceIds.includes(p.id))}
      />
    </SafeAreaView>
  );
}
