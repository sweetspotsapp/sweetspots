import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { Card } from '../ui/card';
import { SSText } from '../ui/SSText';
import { IPlace } from '@/dto/places/place.dto';
import { getPlaceById } from '@/endpoints/places/endpoints';

export default function SuggestionTimingCard({
  itineraryPlace,
  onMoveDown,
    onMoveUp,
}: {
  itineraryPlace: IItineraryPlace;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
}) {
  const [place, setPlace] = React.useState<IPlace | undefined>(
    itineraryPlace.place
  );

  useEffect(() => {
    if (!itineraryPlace.place) {
      getPlaceById(itineraryPlace.placeId!).then((res) => {
        if (res.success && res.data) {
          setPlace(res.data);
        }
      });
    }
  }, [itineraryPlace]);

  return (
    <Card className="p-4">
      {!place ? (
        'Loading...'
      ) : (
        <>
          <SSText>{place?.name}</SSText>
        </>
      )}
    </Card>
  );
}
