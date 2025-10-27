export interface CreateItineraryPlaceDto {
  placeId: string;

  itineraryId: string;

  visitDate?: string;

  visitTime?: string;

  visitDuration: number;

  estimatedCost: number;

  notes?: string;

  orderIndex: number;
}

export interface CreateItineraryDto {
  name: string;
  description?: string;
  collaborators?: string[];
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  itineraryPlaces: CreateItineraryPlaceDto[];
}