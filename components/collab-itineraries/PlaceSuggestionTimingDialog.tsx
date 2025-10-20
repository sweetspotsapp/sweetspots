import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { SSText } from '../ui/SSText';
import { ScrollView } from 'react-native-gesture-handler';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { getAllItineraryPlaces } from '@/endpoints/itinerary-places/endpoints';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';
import SuggestionTimingCard from './SuggestionTimingCard';

export default function PlaceSuggestionTimingDialog({
  open,
  onOpenChange,
  itineraryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itineraryId: string;
}) {
  const [itineraryPlaces, setItineraryPlaces] = useState<IItineraryPlace[]>([]);

  console.log(itineraryPlaces)

  useEffect(() => {
    getAllItineraryPlaces({
      itineraryId: itineraryId,
      limit: 100,
      page: 1,
      suggestionStatus: ItineraryPlaceSuggestionStatus.Accepted
    }).then((res) => {
      if (res.success && res.data) {
        setItineraryPlaces(res.data?.data || []);
      }
    });
  }, [itineraryId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>
            <SSText className="text-center font-semibold !text-lg">
              When do you want to go?
            </SSText>
          </DialogTitle>
        </DialogHeader>
        <ScrollView>
            {
                itineraryPlaces.map((ip) => (
                    <SuggestionTimingCard key={ip.id} itineraryPlace={ip} />
                ))
            }
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
