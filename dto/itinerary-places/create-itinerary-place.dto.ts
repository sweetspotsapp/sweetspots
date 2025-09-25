import { ItineraryPlaceSuggestionStatus } from "./itinerary-place-status.enum";

export interface CreateItineraryPlaceDto {
  itineraryId: string;
  placeId: string;
  visitDate?: string;
  visitTime?: string;
  visitDuration?: number;
  estimatedCost?: number;
  notes?: string;
  orderIndex: number;
  suggestionStatus?: ItineraryPlaceSuggestionStatus;
}