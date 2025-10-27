import { IUserProfile } from "../users/user-profile.dto";

export interface IItineraryPlaceParticipant {
    itineraryPlaceId: string;
    userId: string;
    tappedInAt: string;
    tappedOutAt?: string | null;
    user?: IUserProfile;
}