export interface CreateAutoItineraryDto {
  userId?: string;
  placeIds: string[];
  targetCount?: number;
  startDate?: string | null;
  startTime?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  nameHint?: string;
  description?: string;
  radiusKm?: number;
  maxBudget?: number;
  latitude?: number;
  longitude?: number;
}
