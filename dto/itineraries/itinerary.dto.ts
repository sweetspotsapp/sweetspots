import { IPlace } from "../places/place.dto";

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

export interface IItineraryPlace {
  id: string;
  itineraryId?: string | null;
  placeId?: string | null;
  visitDate?: string | null;
  visitTime?: string | null;
  visitDuration?: number | null;
  estimatedCost?: number | null;
  notes?: string | null;
  orderIndex: number;
  createdAt: string;
  imageUrl?: string | null; // Optional image URL for the place
  suggestionStatus?: "accepted" | "rejected" | "pending";
  // Optional populated place
  place?: IPlace;
}