import { IReview } from "../reviews/review.dto";

export interface IRecommendedPlace {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  distance: string;
  duration: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  vibes: string[];
  images: string[];
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  phoneNumber?: string;
  websiteUrl?: string;
  reviews?: IReview[];
  openingHours?: string[];
  whyVisit?: string | null;
  whatToPrepare?: string | null;
}