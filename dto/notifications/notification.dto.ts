export type NotificationType =
  | "itinerary-collaboration"
  | "removed-from-itinerary"
  | "new-place-nearby"
  | "place-update"
  | "saved-place-change"
  | "itinerary-place-suggested"
  | "itinerary-all-in"
  | "itinerary-all-out"
  | "itinerary-tap-in"
  | "itinerary-tap-out";

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
  itineraryId?: string;
}
