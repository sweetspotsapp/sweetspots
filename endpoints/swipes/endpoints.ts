import { api } from '../client';
import { SwipeDto } from '../../dto/swipes/swipe.dto';
import { IUserSwipe } from '../../dto/swipes/user-swipe.dto';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';

/**
 * Record a user swipe (left/right).
 */
export const recordSwipe = async (
  data: SwipeDto
): Promise<ApiResponse<IUserSwipe>> => {
  const res = await api.post('/swipes', data);
  return res.data;
};

/**
 * Get current user's swipe history.
 */
export const getUserSwipes = async (): Promise<ApiPluralResponse<IUserSwipe>> => {
  const res = await api.get('/swipes/history');
  return res.data;
};

/**
 * Get current user's swipe stats (e.g., count of left/right).
 */
export const getSwipeStats = async (): Promise<ApiResponse<{
  totalSwipes: number;
  rightSwipes: number;
  leftSwipes: number;
  rightSwipeRate: number;
}>> => {
  const res = await api.get('/swipes/stats');
  return res.data;
};