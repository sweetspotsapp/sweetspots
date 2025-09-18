import { View, Text, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import SavedPlaces from '@/components/SavedPlaces';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import SSContainer from '@/components/SSContainer';
import { SSText } from '@/components/ui/SSText';
import SSBackButton from '@/components/SSBackButton';

export default function ChoosePlaces() {
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);

  const handleSelectPlace = (placeId: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  return (
    <SSContainer>
      <View className="mb-5 flex-row items-center gap-4">
        <SSBackButton />
        <SSText variant="bold" className="text-3xl text-orange-600">
          Saved Places
        </SSText>
      </View>
      <SavedPlaces
        isSelectionMode
        onSelectPlace={handleSelectPlace}
        selectedPlaceIds={selectedPlaceIds}
      />
    </SSContainer>
  );
}
