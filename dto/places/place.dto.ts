import { IReview } from "../reviews/review.dto";

export interface IPlace {
  id: string;
  name: string;
  description: string;
  rating: string; // from numeric
  reviewCount: number;
  distance?: string | null;
  duration?: string | null;
  priceRange: string;
  vibes: string[];
  latitude: string;
  longitude: string;
  category: string;
  address: string;
  createdBy?: string | null;

  googlePlaceId?: string | null;
  googleRating?: string | null;
  googleReviewCount?: number | null;
  googlePhoneNumber?: string | null;
  googleWebsite?: string | null;
  googleOpeningHours?: string[] | null;
  googlePriceLevel?: string | null;
  googleTypes: string[];

  lastSyncedAt?: string | null;
  syncSource: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  savedAt?: string | null; // when the place was saved by the user

  // Optional expanded fields
  images?: IPlaceImage[];
  reviews?: IReview[];
  calculatedDistance?: number;
}

export interface ISavedPlace extends IPlace {
  selected?: boolean;
}

export interface IPlaceImage {
  id: string;
  placeId: string;
  url: string;
  description?: string | null;
  order: number;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface IPlaceUpdate {
  id: string;
  placeId?: string | null;
  updateType: string;
  oldValue?: any; // could use a stricter type if needed
  newValue?: any;
  changeDescription?: string | null;
  notificationSent: boolean;
  createdAt: string;
}