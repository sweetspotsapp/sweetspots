export interface CreatePlaceDto {
  name: string;
  description: string;
  rating: number;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  price_range: string;
  vibes?: string[];
  images?: string[];
  duration?: string;
}