import { IPlace } from '@/api/places/dto/place.dto';

export interface IReview {
  id: string;
  placeId?: string | null;
  userId?: string | null;
  rating: number;
  comment?: string | null;
  helpful: number;
  createdAt: string;
  updatedAt: string;

  // Optional extended fields
  userName?: string;
  userAvatar?: string;
  date?: string; // ISO string for frontend
  user?: {
    username: string;
    avatarUrl?: string;
  };
  place?: Partial<IPlace>;
}