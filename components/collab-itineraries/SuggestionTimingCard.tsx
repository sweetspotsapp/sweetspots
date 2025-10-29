import React, { useEffect, useState } from 'react';
import { View, Image, Pressable } from 'react-native';
import moment from 'moment';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { IPlace, IPlaceImage } from '@/dto/places/place.dto';
import { getPlaceById } from '@/endpoints/places/endpoints';
import { Card } from '../ui/card';
import { SSText } from '../ui/SSText';
import { getPlaceImages } from '@/endpoints/place-images/endpoints';
import { Menu } from 'lucide-react-native';

export default function SuggestionTimingCard({
  itineraryPlace,
  index = 0,
  onLongPress,
  isActive = false,
  isDraggable = false,
}: {
  itineraryPlace: IItineraryPlace;
  index?: number;
  onLongPress?: () => void;
  isActive?: boolean;
  isDraggable?: boolean;
}) {
  const [place, setPlace] = useState<IPlace | undefined>(itineraryPlace.place);
  const [placeImages, setPlaceImages] = useState<IPlaceImage[]>([]);

  useEffect(() => {
    if (!itineraryPlace.place) {
      getPlaceById(itineraryPlace.placeId!).then((res) => {
        if (res.success && res.data) setPlace(res.data);
      });
    }
  }, [itineraryPlace]);

  useEffect(() => {
    if (place) {
      getPlaceImages({
        placeId: place.id,
        limit: 1,
      }).then((res) => {
        if (res.success && res.data) {
          setPlaceImages(res.data.data);
        }
      });
    }
  }, [place]);

  const placeImageUrl =
    placeImages && placeImages.length > 0
      ? placeImages[0].url
      : place?.images && place.images.length > 0
      ? place.images[0].url
      : itineraryPlace.imageUrl;

  const start = moment(`${itineraryPlace.visitDate}T${itineraryPlace.visitTime}`);
  const end = moment(start).add(Number(itineraryPlace.visitDuration), 'hours');

  const timeRange = `${start.format('hh:mm A')} – ${end.format('hh:mm A')}`;

  const bgColor = isActive ? 'bg-orange-100' : 'bg-white';
  const borderColor = isActive ? 'border-orange-400' : null;
  const textMuted = 'text-muted-foreground';

  return (
    <Pressable onLongPress={isDraggable ? onLongPress : undefined} delayLongPress={200}>
      <Card className={`flex-row items-center p-4 ${bgColor} ${borderColor}`}>
        {/* Index bubble */}
        <View className="w-7 h-7 rounded-full bg-orange-400 items-center justify-center mr-3">
          <SSText variant="bold" className="text-white text-xs">
            {index + 1}
          </SSText>
        </View>

        {/* Thumbnail */}
        {placeImageUrl ? (
          <Image
            source={{ uri: placeImageUrl }}
            className="w-12 h-12 rounded-xl mr-3"
            resizeMode="cover"
          />
        ) : (
          <View className="w-12 h-12 rounded-xl mr-3 bg-gray-200 items-center justify-center">
            <SSText className="text-gray-500 text-xs">No Img</SSText>
          </View>
        )}

        {/* Info */}
        <View className="flex-1">
          <SSText variant="bold" className="text-base mb-0.5">
            {place?.name || 'Loading...'}
          </SSText>
          <SSText className={`${textMuted} text-sm`}>{timeRange}</SSText>
        </View>
        {
          isDraggable && (
            <Menu
              className='text-muted-foreground'
            />
          )
        }
      </Card>
    </Pressable>
  );
}