// export interface Place {
//   id: string;
//   name: string;
//   description: string;
//   rating: number;
//   reviewCount: number;
//   distance: string;
//   duration: string;
//   priceRange: string;
//   vibes: string[];
//   images: string[];
//   latitude: number;
//   longitude: number;
//   category: string;
//   address: string;
//   reviews?: Review[];
// }

import { IPlace } from "@/api/places/dto/place.dto";

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface SavedPlace extends IPlace {
  savedAt: string;
  selected?: boolean;
}

export interface ItineraryPlace extends SavedPlace {
  visitDate?: string;
  visitTime?: string;
  visitDuration?: number; // in hours
  estimatedCost?: number;
  notes?: string;
  order: number;
}

export interface Itinerary {
  id: string;
  name: string;
  description?: string;
  places: ItineraryPlace[];
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  collaborators: string[];
  isPublic: boolean;
  startDate?: string;
  endDate?: string;
  totalEstimatedCost?: number;
  totalDuration?: number; // in hours
}

export interface TripSummary {
  totalCost: number;
  totalDuration: number; // in hours
  totalDays: number;
  averageCostPerDay: number;
  placesPerDay: number;
}