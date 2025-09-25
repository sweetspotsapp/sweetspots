import { IItineraryPlace } from "../itinerary-places/itinerary-place.dto";

export interface IItinerary {
  id: string;
  name: string;
  description?: string | null;
  userId?: string | null;
  collaborators?: string[];
  isPublic: boolean;
  startDate?: string | null; // ISO format
  endDate?: string | null;
  totalEstimatedCost?: string | null; // from numeric
  maxEstimatedCost?: number;
  minEstimatedCost?: number;
  totalDuration?: number | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;

  // Optional extended fields
  placesCount?: number;
  creator?: {
    username: string;
    avatarUrl?: string;
  };
  itineraryPlaces?: IItineraryPlace[];
  isOwner?: boolean;
}
