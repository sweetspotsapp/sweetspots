import { View, Text } from 'react-native';
import React from 'react';
import { cn } from '@/lib/utils';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';
import { SSText } from '../ui/SSText';
import { capitalCase } from 'change-case';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';

export default function ItineraryPlaceStatus({
  itineraryPlace,
}: {
  itineraryPlace: IItineraryPlace;
}) {
  const renderIcon = () => {
    switch (itineraryPlace.suggestionStatus) {
      case ItineraryPlaceSuggestionStatus.Accepted:
        return <CheckCircle size={16} color="#059669" />;
      case ItineraryPlaceSuggestionStatus.Rejected:
        return <XCircle size={16} color="#DC2626" />;
      case ItineraryPlaceSuggestionStatus.Pending:
        return <Clock size={16} color="#D97706" />;
      default:
        return null;
    }
  };
  return (
      <View
        className={cn('px-3 py-1 rounded-full flex-row items-center gap-2 h-fit w-fit', {
          'bg-green-100':
            itineraryPlace.suggestionStatus ===
            ItineraryPlaceSuggestionStatus.Accepted,
          'bg-red-100':
            itineraryPlace.suggestionStatus ===
            ItineraryPlaceSuggestionStatus.Rejected,
          'bg-yellow-100':
            itineraryPlace.suggestionStatus ===
            ItineraryPlaceSuggestionStatus.Pending,
        })}
      >
        {renderIcon()}
        <SSText variant="semibold" className="text-sm">
          {capitalCase(itineraryPlace.suggestionStatus || ItineraryPlaceSuggestionStatus.Pending)}
        </SSText>
      </View>
  );
}
