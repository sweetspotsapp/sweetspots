import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import SSContainer from '@/components/SSContainer';
import { useAuth } from '@/hooks/useAuth';
import { router, useLocalSearchParams } from 'expo-router';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { getItineraryById } from '@/endpoints/itineraries/endpoints';
import SSSpinner from '@/components/ui/SSSpinner';
import SSBackButton from '@/components/SSBackButton';
import { SSText } from '@/components/ui/SSText';
import ChoosePlaces from '@/components/places/ChoosePlaces';
import { Button } from '@/components/ui/button';
import { getCentralCoordinate } from '@/endpoints/places/endpoints';
import { IItineraryUser } from '@/dto/itinerary-users/itinerary-user.dto';
import { bulkCreateItineraryPlaces, createItineraryPlace } from '@/endpoints/itinerary-places/endpoints';

export default function AddPlacesPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(true);
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);

  useEffect(() => {
    setIsLoadingItinerary(true);
    getItineraryById(id)
      .then((res) => {
        if (res.data) {
          setItinerary(res.data);
        }
      })
      .finally(() => {
        setIsLoadingItinerary(false);
      });
  }, [id]);

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
  const [itineraryUsers, setItineraryUsers] = useState<IItineraryUser[]>([]);
  const [isCreatingItinerary, setIsCreatingItinerary] = useState(false);

  //   function handleCreateItinerary() {
  //     setIsCreatingItinerary(true);
  //     createAutoItinerary({
  //       placeIds: selectedPlaceIds,
  //       // startDate: draft.startDateISO,
  //       startTime: draft.startTimeISO,
  //       // endDate: draft.endDateISO,
  //       targetCount: draft.targetCount,
  //       maxBudget: draft.budget,
  //       userId: user?.uid,
  //     })
  //       .then((res) => {
  //         const itineraryId = res.data?.id;
  //         if (itineraryId) {
  //           router.replace(`/itineraries/${itineraryId}`);
  //         }
  //       })
  //       .finally(() => {
  //         setIsCreatingItinerary(false);
  //       });
  //   }

  const [centralisedCoords, setCentralisedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  useEffect(() => {
    const placeIds =
      itinerary?.itineraryPlaces
        ?.map((ip) => ip.placeId)
        .filter((id): id is string => Boolean(id)) ?? [];

    (async () => {
      try {
        if (placeIds.length) {
          const coords = await getCentralCoordinate(placeIds);
          if (coords.data) setCentralisedCoords(coords.data);
        }
      } catch {}
    })();
  }, [itinerary]);

    const itineraryUser = itineraryUsers?.find((iu) => iu.userId === user?.uid);
  const isOwner = itineraryUser?.role === 'owner';
  const isEditor = itineraryUser?.role === 'editor';

  const [isLoading, setIsLoading] = useState(false);

  async function handleAddPlaces() {
    setIsLoading(true);
    bulkCreateItineraryPlaces(
      selectedPlaceIds.map((placeId, index) => ({
        placeId,
        itineraryId: id,
        orderIndex: index,
        estimatedCost: 0,
        visitDuration: 60,
      }))
    ).then(() => {
      router.back();
    }).finally(() => {
      setIsLoading(false);
    });
  }

  return (
    <SSContainer>
      {/* <CreatingItineraryLoadingDialog
        open={isCreatingItinerary}
        onOpenChange={() => {}}
      /> */}
      {isLoadingItinerary || centralisedCoords === null ? (
        <SSSpinner />
      ) : (
        <>
          <View className="mb-5 flex-row items-center gap-4">
            <SSBackButton />
            <View>
              <SSText variant="bold" className="text-3xl text-orange-600">
                Choose your sweet spots
              </SSText>
              {itinerary?.name && (
                <SSText className="text-xl text-muted-foreground">
                  {itinerary.name ? `for "${itinerary.name}"` : null}
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
            lat={centralisedCoords?.latitude}
            lon={centralisedCoords?.longitude}
          />
          {selectedCount > 0 && (
            <Button
              className="absolute bottom-24 left-5 right-5 shadow-lg"
              onPress={handleAddPlaces}
              disabled={isLoading}
            >
              <SSText variant="semibold" className="text-white text-base">
                {
                    isOwner ? `Add to Itinerary (${selectedCount})` : `Suggest ${selectedCount} Spot${selectedCount > 1 ? 's' : ''}`
                }
              </SSText>
            </Button>
          )}
        </>
      )}
    </SSContainer>
  );
}
