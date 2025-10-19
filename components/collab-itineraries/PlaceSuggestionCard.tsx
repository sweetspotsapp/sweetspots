import { View, Text } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { IPlace } from '@/dto/places/place.dto';
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { getPlaceById } from '@/endpoints/places/endpoints';
import { getUserProfileById } from '@/endpoints/users/endpoints';

export default function PlaceSuggestionCard({
  itineraryPlace,
}: {
  itineraryPlace: IItineraryPlace;
}) {
  const [place, setPlace] = useState<IPlace | null>(
    itineraryPlace.place || null
  );
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);

  useEffect(() => {
    if (itineraryPlace.placeId && !itineraryPlace.place) {
      getPlaceById(itineraryPlace.placeId!).then((res) => {
        if (res.success && res.data) {
          setPlace(res.data);
        }
      });
    }
  }, [itineraryPlace.placeId]);

  useEffect(() => {
    if (itineraryPlace.userId) {
      getUserProfileById(itineraryPlace.userId).then((res) => {
        if (res.success && res.data) {
          setUserProfile(res.data);
        }
      });
    }
  }, [itineraryPlace.userId]);

  return (
    <View>
      <Text>{itineraryPlace.place?.name}</Text>
    </View>
  );
}
