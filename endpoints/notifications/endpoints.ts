import { IUserNotification } from '@/dto/notifications/notification.dto';
import { api } from '../client';
import { ApiResponse } from '../pagination.dto';
import { GetNotificationsDto } from '@/dto/notifications/get-notifications.dto';

export const getUserNotifications = async (
  params: GetNotificationsDto
): Promise<ApiResponse<IUserNotification[]>> => {
  const res = await api.get('/notifications', { params });
  return res.data;
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<ApiResponse<IUserNotification>> => {
  const res = await api.post(`/notifications/${notificationId}/read`);
  return res.data;
};

// POST /notifications/settings
// export type UpdateNotificationSettingsPayload = Partial<INotificationSettings> & {
//   deviceToken?: string;
// };

// export const updateNotificationSettings = async (
//   payload: UpdateNotificationSettingsPayload
// ): Promise<ApiResponse<INotificationSettings>> => {
//   const res = await api.post('/notifications/settings', payload);
//   return res.data;
// };