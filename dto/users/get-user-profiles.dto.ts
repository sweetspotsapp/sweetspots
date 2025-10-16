export class GetUserProfilesDto {
  limit?: number = 10;
  page?: number = 1;
  usernames?: string[];
  query?: string;
  location?: string;
  createdAfter?: string;
  updatedAfter?: string;
  hasSummary?: boolean;
  withPreferences?: boolean;
}