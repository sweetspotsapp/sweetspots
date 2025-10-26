import { ItineraryPlaceSuggestionStatus } from "./itinerary-place-status.enum";

export class GetItineraryPlacesQueryDto {
  page: number = 1;
  limit: number = 20;
  itineraryId?: string;
  userId?: string;
  suggestionStatus?: ItineraryPlaceSuggestionStatus;
}