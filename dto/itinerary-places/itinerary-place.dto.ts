import { IPlace } from "../places/place.dto";

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