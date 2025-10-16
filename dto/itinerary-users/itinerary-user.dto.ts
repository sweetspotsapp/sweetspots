import { IUserProfile } from "../users/user-profile.dto";

export interface IItineraryUser {
  id: string;
  itineraryId: string;
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
  createdAt: string;
  user?: IUserProfile;
}
