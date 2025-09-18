import { View } from 'react-native';
import React, { useState } from 'react';
import SavedPlaces from '@/components/SavedPlaces';
// import SSLinearGradient from '@/components/ui/SSLinearGradient';
import SSContainer from '@/components/SSContainer';
import { SSText } from '@/components/ui/SSText';
import SSBackButton from '@/components/SSBackButton';
import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ChoosePlaces() {
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);

  const handleSelectPlace = (placeId: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  const selectedCount = selectedPlaceIds.length;

  const [tab, setTab] = useState('all');

  return (
    <SSContainer>
      <View className="mb-5 flex-row items-center gap-4">
        <SSBackButton />
        <SSText variant="bold" className="text-3xl text-orange-600">
          Choose your sweet spots!
        </SSText>
      </View>
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="saved">
            <SSText>Saved Places</SSText>
          </TabsTrigger>
          <TabsTrigger value="discover">
            <SSText>Discover</SSText>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="saved">
          <SavedPlaces
            isSelectionMode
            onSelectPlace={handleSelectPlace}
            selectedPlaceIds={selectedPlaceIds}
          />
        </TabsContent>
        <TabsContent value="discover">
          discovery
        </TabsContent>
      </Tabs>
      {selectedCount > 0 && (
        <Button
          className="absolute bottom-24 left-5 right-5 shadow-lg"
          // onPress={handleCreateItinerary}
        >
          <SSText variant="semibold" className="text-white text-base">
            Create Itinerary ({selectedCount})
          </SSText>
        </Button>
      )}
    </SSContainer>
  );
}
