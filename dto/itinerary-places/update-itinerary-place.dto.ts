import { CreateItineraryPlaceDto } from "./create-itinerary-place.dto";
import { ItineraryPlaceSuggestionStatus } from "./itinerary-place-status.enum";

export interface UpdateItineraryPlaceDto extends Partial<CreateItineraryPlaceDto> {
  itineraryPlaceId: string;
  suggestionStatus?: ItineraryPlaceSuggestionStatus;
}