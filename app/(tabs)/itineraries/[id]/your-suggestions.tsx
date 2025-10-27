import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import {
  deleteItineraryPlace,
  getAllItineraryPlaces,
} from '@/endpoints/itinerary-places/endpoints';
import { Link, useLocalSearchParams } from 'expo-router';
import SSContainer from '@/components/SSContainer';
import { FlatList } from 'react-native-gesture-handler';
import PlaceSuggestionCard from '@/components/collab-itineraries/PlaceSuggestionCard';
import { SSText } from '@/components/ui/SSText';
import SSBackButton from '@/components/SSBackButton';
import PlaceSuggestionModal from '@/components/collab-itineraries/PlaceSuggestionModal';
import { IPlace } from '@/dto/places/place.dto';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import SSSpinner from '@/components/ui/SSSpinner';

export default function PlaceSuggestionsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth().user;
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryPlaces, setItineraryPlaces] = useState<IItineraryPlace[]>([]);

  function fetchData() {
    setIsLoading(true);
    getAllItineraryPlaces({
      itineraryId: id,
      limit: 50,
      page: 1,
      userId: user?.uid,
    })
      .then((res) => {
        if (res.success && res.data) {
          setItineraryPlaces(res.data?.data || []);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    // Fetch itinerary places from API
    if (!user) return;

    fetchData();
  }, [user]);

  const [selectedPlace, setSelectedPlace] = useState<IPlace | null>(null);
  const selectedItineraryPlace = itineraryPlaces.find(
    (ip) => ip.placeId === selectedPlace?.id
  );
  const selectedItineraryPlaceId = selectedItineraryPlace
    ? String(selectedItineraryPlace.id)
    : null;

  const [isAddingToItinerary, setIsAddingToItinerary] = useState(false);

  function handleAddToItinerary() {
    setIsAddingToItinerary(true);
    // Logic to add the selected place to the itinerary
  }

  function handleCancelSuggestion() {
    deleteItineraryPlace(selectedItineraryPlaceId!).then((res) => {
      if (res.success) {
        fetchData();
        setSelectedPlace(null);
      }
    });
  }

  return (
    <SSContainer>
      {selectedPlace && selectedItineraryPlace && (
        <PlaceSuggestionModal
          visible={!!selectedPlace && !isAddingToItinerary}
          onClose={() => setSelectedPlace(null)}
          place={selectedPlace}
          itineraryPlace={selectedItineraryPlace}
          onAddPlaceToItinerary={handleAddToItinerary}
          onCancelSuggestion={handleCancelSuggestion}
          hideAddButton
        />
      )}

      <View className="flex-row items-center gap-4 my-4">
        {/* <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => goBack('/profile')}
          >
            <ArrowLeft size={24} className="text-orange-500" />
          </TouchableOpacity> */}
        <SSBackButton />
        <SSText variant="bold" className="text-3xl text-orange-600">
          Your Suggested Spots
        </SSText>
        {/* {Platform.OS === 'web' ? (
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
              onPress={loadItineraries}
            >
              <RefreshCcw size={24} className="text-orange-500" />
            </TouchableOpacity>
          ) : (
            <View className="w-11" />
          )} */}
      </View>
      {isLoading ? (
        <SSSpinner />
      ) : (
        <FlatList
          data={itineraryPlaces}
          renderItem={({ item }) => (
            <View className="mb-3">
              <PlaceSuggestionCard
                itineraryPlace={item}
                onSelect={setSelectedPlace}
                hideUser
              />
            </View>
          )}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerClassName={
            itineraryPlaces.length === 0
              ? 'flex-1 justify-center items-center pt-25 px-10 kontol'
              : 'pb-6'
          }
          columnWrapperClassName="gap-4"
          className="gap-4"
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center pt-25 px-10">
              <SSText className="text-2xl text-orange-600 text-center mb-3 font-bold">
                You have no suggestions yet!
              </SSText>
              <Link href={`/itineraries/${id}/add-places`}>
                <Button>
                  <SSText>Add Spot Suggestions</SSText>
                </Button>
              </Link>
            </View>
          }
        />
      )}
    </SSContainer>
  );
}
