export class GetRecommendationsDto {
  limit?: number = 10;
  vibes?: string[];
  rating?: number;
  distance?: number;
  priceRange?: string[];
  latitude?: number;
  longitude?: number;
}