export type NotificationType = 'itinerary-collaboration';

export interface IUserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  sentAt?: string;
  createdAt: string;
}
