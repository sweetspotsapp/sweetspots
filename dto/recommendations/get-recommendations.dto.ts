export class GetRecommendationsDto {
  limit?: number = 10;
  page?: number = 1;
  vibes?: string[];
  rating?: number;
  distance?: number;
  priceRange?: string[];
  latitude?: number;
  longitude?: number;
  seed?: string;
}