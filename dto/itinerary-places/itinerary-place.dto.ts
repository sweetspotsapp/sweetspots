import { IPlace } from "../places/place.dto";

export interface IItineraryPlace {
  longitude(longitude: any): number;
  id: string;
  itineraryId?: string | null;
  placeId?: string | null;
  visitDate: string;
  visitTime: string;
  visitDuration: number;
  estimatedCost: number;
  notes?: string | null;
  orderIndex: number;
  createdAt: string;
  imageUrl?: string | null; // Optional image URL for the place
  suggestionStatus?: "accepted" | "rejected" | "pending";
  // Optional populated place
  place?: IPlace;
  userId?: string | null;
  includedUserIds: string[];
}