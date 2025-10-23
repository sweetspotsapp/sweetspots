import { View, Text, Image } from 'react-native';
import React from 'react';
import { Card } from '../ui/card';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { SSText } from '../ui/SSText';
import moment from 'moment';

export default function ItineraryMapMarker({
  itineraryPlace,
}: {
  itineraryPlace: IItineraryPlace;
}) {
  const place = itineraryPlace.place;
  const imageUrl = place?.placeImages?.[0]?.url;
  const startDateTime = moment(`${itineraryPlace.visitDate}T${itineraryPlace.visitTime}`);
  const endDateTime = moment(startDateTime).add(itineraryPlace.visitDuration, 'hours');

  return (
    <Card className="p-4 max-w-64">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-orange-600">
          <Text className="text-white font-bold text-sm">
            {' '}
            {itineraryPlace.orderIndex + 1}{' '}
          </Text>
        </View>
        <SSText>{place?.name}</SSText>
      </View>
      <View className='mb-2'>
        <SSText className="text-sm text-gray-700">
          {startDateTime.format('h:mm A')} - {endDateTime.format('h:mm A')}
        </SSText>
      </View>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-24 h-24 rounded-xl"
          style={{ resizeMode: 'cover' }}
        />
      )}
      <View className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 -mt-2 rounded-[2px]" />
      
    </Card>
  );
}
