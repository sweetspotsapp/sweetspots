import { View } from 'react-native';
import React, { useState } from 'react';
import SavedPlaces from '@/components/SavedPlaces';
import SSContainer from '@/components/SSContainer';
import { SSText } from '@/components/ui/SSText';
import SSBackButton from '@/components/SSBackButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useItineraryDraft } from '@/store/useItineraryDraft';
import DiscoverPlaces from '@/components/discoverPlaces/DiscoverPlaces';
import { ScrollView } from 'react-native-gesture-handler';

export default function ChoosePlaces() {
  const draft = useItineraryDraft((state) => state.draft);

  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [placeCounts, setPlaceCounts] = useState<{ [key: string]: number }>({});

  const handleSelectPlace = (placeId: string, tab: 'saved' | 'discover') => {
    setSelectedPlaceIds((prev) => {
      if (prev.includes(placeId)) {
        setPlaceCounts((prevCounts) => ({
          ...prevCounts,
          [tab]: Math.max((prevCounts[tab] || 1) - 1, 0),
        }));
      } else {
        setPlaceCounts((prevCounts) => ({
          ...prevCounts,
          [tab]: (prevCounts[tab] || 0) + 1,
        }));
      }
      return prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    });
  };

  const selectedCount = selectedPlaceIds.length;

  const [tab, setTab] = useState('saved');

  return (
    <SSContainer>
      {!draft ? null : (
        <>
          <View className="mb-5 flex-row items-center gap-4">
            <SSBackButton />
            <SSText variant="bold" className="text-3xl text-orange-600">
              Choose your sweet spots!
            </SSText>
          </View>
          <ScrollView className="flex-1">
            <Tabs value={tab} onValueChange={setTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="saved">
                  <SSText>Saved Places{placeCounts.saved ? (' (' + placeCounts.saved + ')') : null}</SSText>
                </TabsTrigger>
                <TabsTrigger value="discover">
                  <SSText>Discover{placeCounts.discover ? (' (' + placeCounts.discover + ')') : null}</SSText>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="saved">
                <SavedPlaces
                  isSelectionMode
                  onSelectPlace={(placeId) => handleSelectPlace(placeId, 'saved')}
                  selectedPlaceIds={selectedPlaceIds}
                  coords={
                    draft.lat && draft.lon
                      ? {
                          lat: draft.lat,
                          lon: draft.lon,
                        }
                      : undefined
                  }
                />
              </TabsContent>
              <TabsContent value="discover">
                <DiscoverPlaces
                  isSelectionMode
                  onSelectPlace={(placeId) => handleSelectPlace(placeId, 'discover')}
                  selectedPlaceIds={selectedPlaceIds}
                  coords={
                    draft.lat && draft.lon
                      ? {
                          lat: draft.lat,
                          lon: draft.lon,
                        }
                      : undefined
                  }
                />
              </TabsContent>
            </Tabs>
          </ScrollView>
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
        </>
      )}
    </SSContainer>
  );
}
