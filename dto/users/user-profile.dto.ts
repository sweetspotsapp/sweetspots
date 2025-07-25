export interface IUserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  travelPreferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}