import { IPlace } from "@/api/places/dto/place.dto";

export interface IUserSwipe {
  id: string;
  userId: string;
  placeId: string;
  direction: 'left' | 'right';
  timestamp: Date | null;
  place?: IPlace;
}