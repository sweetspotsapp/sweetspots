import { IPlace } from "../places/place.dto";

export interface IUserSwipe {
  id: string;
  userId: string;
  placeId: string;
  direction: 'left' | 'right';
  timestamp: Date | null;
  place?: IPlace;
}