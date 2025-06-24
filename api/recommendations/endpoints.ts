import { api } from '../client';
import { ApiResponse } from '../pagination.dto';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { IRecommendedPlace } from './dto/recommendation.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

export const getRecommendations = async (
  params?: GetRecommendationsDto
): Promise<ApiResponse<IRecommendedPlace[]>> => {
  const res = await api.get('/recommendations', { params });
  return res.data;
};

export const updateTravelPreferences = async (
  data: UpdatePreferencesDto
): Promise<ApiResponse<{ success: boolean }>> => {
  const res = await api.post('/recommendations/preferences', data);
  return res.data;
};