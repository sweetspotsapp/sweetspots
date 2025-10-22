import { Image, Pressable, View } from 'react-native';
import React, { use, useEffect, useState } from 'react';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { IPlace, IPlaceImage } from '@/dto/places/place.dto';
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { getPlaceById } from '@/endpoints/places/endpoints';
import { getUserProfileById } from '@/endpoints/users/endpoints';
import { getPlaceImages } from '@/endpoints/place-images/endpoints';
import { Card } from '../ui/card';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';
import { updateItineraryPlace } from '@/endpoints/itinerary-places/endpoints';
import { SSText } from '../ui/SSText';
import ProfileAvatar from '../user/ProfileAvatar';
import VibePill from '../ui/VibePill';

export default function PlaceSuggestionCard({
  itineraryPlace,
  onAccept,
  onReject,
  onSelect,
}: {
  itineraryPlace: IItineraryPlace;
  onAccept?: () => void;
  onReject?: () => void;
  onSelect?: (place: IPlace, itineraryPlace: IItineraryPlace) => void;
}) {
  const [place, setPlace] = useState<IPlace | null>(
    itineraryPlace.place || null
  );
  const [placeImages, setPlaceImages] = useState<IPlaceImage[]>(
    place?.images || []
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
    if (!place?.images || place.images.length === 0) {
      getPlaceImages({
        placeId: place?.id,
        limit: 1,
      }).then((res) => {
        if (res.success && res.data) {
          setPlaceImages(res.data.data);
        }
      });
    }
  }, [place?.images]);

  useEffect(() => {
    if (itineraryPlace.userId) {
      getUserProfileById(itineraryPlace.userId).then((res) => {
        if (res.success && res.data) {
          setUserProfile(res.data);
        }
      });
    }
  }, [itineraryPlace.userId]);

  function handleStatusChange(newStatus: ItineraryPlaceSuggestionStatus) {
    updateItineraryPlace(itineraryPlace.id, {
      suggestionStatus: newStatus,
    }).then((res) => {
      if (res.success && res.data) {
        if (newStatus === ItineraryPlaceSuggestionStatus.Accepted) {
          onAccept && onAccept();
        } else if (newStatus === ItineraryPlaceSuggestionStatus.Rejected) {
          onReject && onReject();
        }
      }
    });
  }

  const imageUrl = placeImages.length > 0 ? placeImages[0].url : null;

  return (
    <Pressable onPress={() => place && onSelect?.(place, itineraryPlace)}>
      <Card className="p-4">
        <View className="flex-row gap-4">
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 120, height: 120, borderRadius: 8 }}
            />
          )}
          <View>
            <SSText variant="semibold" className="text-xl">
              {itineraryPlace.place?.name}
            </SSText>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {place?.vibes.map((vibe, index) => (
                <VibePill vibe={vibe} key={index} />
              ))}
            </View>
            {userProfile && (
              <View className="flex-row gap-2">
                <ProfileAvatar user={userProfile} />
                <View>
                  <SSText className="text-xs text-muted-foreground">By</SSText>
                  <SSText className="text-sm font-medium">
                    {userProfile.username}
                  </SSText>
                </View>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
