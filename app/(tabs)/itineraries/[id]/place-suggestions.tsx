import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import {
  getAllItineraryPlaces,
  updateItineraryPlace,
} from '@/endpoints/itinerary-places/endpoints';
import { useLocalSearchParams } from 'expo-router';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';
import SSContainer from '@/components/SSContainer';
import { FlatList } from 'react-native-gesture-handler';
import PlaceSuggestionCard from '@/components/collab-itineraries/PlaceSuggestionCard';
import { SSText } from '@/components/ui/SSText';
import SSBackButton from '@/components/SSBackButton';
import PlaceSuggestionModal from '@/components/collab-itineraries/PlaceSuggestionModal';
import { IPlace } from '@/dto/places/place.dto';
import PlaceSuggestionTimingDialog from '@/components/collab-itineraries/PlaceSuggestionTimingDialog';

export default function PlaceSuggestionsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [itineraryPlaces, setItineraryPlaces] = useState<IItineraryPlace[]>([]);

  function fetchData() {
    getAllItineraryPlaces({
      itineraryId: id,
      suggestionStatus: ItineraryPlaceSuggestionStatus.Pending,
      limit: 50,
      page: 1,
    }).then((res) => {
      if (res.success && res.data) {
        setItineraryPlaces(res.data?.data || []);
      }
    });
  }

  useEffect(() => {
    // Fetch itinerary places from API
    fetchData();
  }, []);

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

  return (
    <SSContainer>
      {selectedPlace && selectedItineraryPlace && (
        <PlaceSuggestionTimingDialog
          open={!!selectedItineraryPlaceId && isAddingToItinerary}
          onOpenChange={setIsAddingToItinerary}
          itineraryId={id}
          itineraryPlace={selectedItineraryPlace}
        />
      )}
      {selectedPlace && selectedItineraryPlace && (
        <PlaceSuggestionModal
          visible={!!selectedPlace && !isAddingToItinerary}
          onClose={() => setSelectedPlace(null)}
          place={selectedPlace}
          itineraryPlace={selectedItineraryPlace}
          onAddPlaceToItinerary={handleAddToItinerary}
          onFinishReject={fetchData}
        />
      )}

      <View className="flex-row items-center gap-4 my-5">
        {/* <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => goBack('/profile')}
          >
            <ArrowLeft size={24} className="text-orange-500" />
          </TouchableOpacity> */}
        <SSBackButton />
        <SSText variant="bold" className="text-3xl text-orange-600">
          Suggested Spots
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
      <FlatList
        data={itineraryPlaces}
        renderItem={({ item }) => (
          <View className="mb-3">
            <PlaceSuggestionCard
              itineraryPlace={item}
              onSelect={setSelectedPlace}
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
            <Text className="text-2xl text-orange-600 text-center mb-3 font-bold">
              No place suggestions yet
            </Text>
            <Text className="text-base text-slate-500 text-center leading-6">
              There are no pending place suggestions for this itinerary.
            </Text>
          </View>
        }
      />
    </SSContainer>
  );
}
