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
import { createAutoItinerary } from '@/endpoints/auto-itinerary/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import CreatingItineraryLoadingDialog from '@/components/itineraries/CreatingItineraryLoadingDialog';
import ChoosePlaces from '@/components/places/ChoosePlaces';

export default function ChoosePlacesPage() {
  const draft = useItineraryDraft((state) => state.draft);

  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [placeCounts, setPlaceCounts] = useState<
    Partial<Record<'saved' | 'discover', number>>
  >({});

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
        : [...prev, placeId];
    });
  };

  const selectedCount = selectedPlaceIds.length;

  const [tab, setTab] = useState('saved');

  const { user } = useAuth();

  const [isCreatingItinerary, setIsCreatingItinerary] = useState(false);

  function handleCreateItinerary() {
    setIsCreatingItinerary(true);
    createAutoItinerary({
      placeIds: selectedPlaceIds,
      // startDate: draft.startDateISO,
      startTime: draft.startTimeISO,
      // endDate: draft.endDateISO,
      targetCount: draft.targetCount,
      maxBudget: draft.budget,
      userId: user?.uid,
    })
      .then((res) => {
        const itineraryId = res.data?.id;
        if (itineraryId) {
          router.replace(`/itineraries/${itineraryId}`);
        }
      })
      .finally(() => {
        setIsCreatingItinerary(false);
      });
  }

  return (
    <SSContainer>
      <CreatingItineraryLoadingDialog
        open={isCreatingItinerary}
        onOpenChange={() => {}}
      />
      {!draft ? null : (
        <>
          <View className="my-5 flex-row items-center gap-4">
            <SSBackButton />
            <View>
              <SSText variant="bold" className="text-3xl text-orange-600">
                Choose your sweet spots!
              </SSText>
              {draft.query && (
                <SSText className="text-xl text-muted-foreground">
                  {draft.query ? `for "${draft.query}"` : null}
                </SSText>
              )}
            </View>
          </View>
          <ChoosePlaces
            onChangeTab={setTab}
            onSelectDiscoverPlace={(placeId) =>
              handleSelectPlace(placeId, 'discover')
            }
            onSelectSavedPlace={(placeId) =>
              handleSelectPlace(placeId, 'saved')
            }
            selectedPlaceIds={selectedPlaceIds}
            selectedDiscoverCount={placeCounts.discover || 0}
            selectedSavedCount={placeCounts.saved || 0}
            tab={tab as any}
            lat={draft.lat}
            lon={draft.lon}
          />
          {selectedCount > 0 && (
            <Button
              className="absolute bottom-24 left-5 right-5 shadow-lg"
              onPress={handleCreateItinerary}
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
