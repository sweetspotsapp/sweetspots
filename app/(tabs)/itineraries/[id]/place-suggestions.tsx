import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { getAllItineraryPlaces } from '@/endpoints/itinerary-places/endpoints';
import { useLocalSearchParams } from 'expo-router';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';

export default function PlaceSuggestionsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [itineraryPlaces, setItineraryPlaces] = useState<IItineraryPlace[]>([]);

    useEffect(() => {
        // Fetch itinerary places from API
        getAllItineraryPlaces({
            itineraryId: id,
            suggestionStatus: ItineraryPlaceSuggestionStatus.Pending,
            limit: 50,
            page: 1,
        }).then((res) => {
            if (res.success && res.data) {
                setItineraryPlaces(res.data?.data || []);
            }
        })
    }, []);

    console.log('Itinerary Places:', itineraryPlaces);

  return (
    <View>
      <Text>PlaceSuggestionsPage</Text>
    </View>
  )
}