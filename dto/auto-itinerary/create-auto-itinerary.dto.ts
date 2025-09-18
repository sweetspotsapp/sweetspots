export interface CreateAutoItineraryDto {
  userId?: string;
  placeIds: string[];
  targetCount?: number;
  startDate?: string | null;
  startTime?: string | null;
  nameHint?: string;
  description?: string;
  radiusKm?: number;
}
