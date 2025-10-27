export class GetNotificationsDto {
  page: number = 1;
  limit: number = 20;
  itineraryId?: string;
  // userId?: string;
}