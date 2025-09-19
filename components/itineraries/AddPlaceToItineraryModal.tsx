import { Modal, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react-native';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { IPlace } from '@/dto/places/place.dto';
import SavedPlaces from '../SavedPlaces';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import SSContainer from '../SSContainer';

interface AddPlaceToItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: (places: IPlace[]) => void;
  itineraryPlaceIds: string[];
  itineraryName?: string;
}

export default function AddPlaceToItineraryModal({
  visible,
  onClose,
  onAdded,
  itineraryPlaceIds,
  itineraryName,
}: AddPlaceToItineraryModalProps) {
  const { savedPlaces } = useSavedPlaces();
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);

  const handleSelectPlace = (placeId: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  console.log('Selected Place IDs:', selectedPlaceIds, savedPlaces);

  const handleAddToItinerary = () => {
    const selectedPlaces = savedPlaces.filter((place) =>
      selectedPlaceIds.includes(place.id)
    );
    onAdded(selectedPlaces);
    setSelectedPlaceIds([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SSContainer disableBottomPadding>
        <View className="flex-row justify-between items-start  pt-5 pb-4 border-b border-slate-100">
          <View className="flex-1">
            <SSText variant="bold" className="text-2xl text-gray-800 mb-1">
              Add to {itineraryName || 'Itinerary'}
            </SSText>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center ml-4"
          >
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>
        <SavedPlaces
          isSelectionMode
          onSelectPlace={handleSelectPlace}
          selectedPlaceIds={selectedPlaceIds}
          hiddenPlaceIds={itineraryPlaceIds}
        />
        {selectedPlaceIds.length > 0 && (
          <Button
            className="absolute bottom-7 left-5 right-5 shadow-lg"
            onPress={handleAddToItinerary}
          >
            <Plus size={24} color="#ffffff" />
            <SSText variant="semibold" className="text-white text-base">
              Add to Itinerary ({selectedPlaceIds.length})
            </SSText>
          </Button>
        )}
      </SSContainer>
    </Modal>
  );
}
