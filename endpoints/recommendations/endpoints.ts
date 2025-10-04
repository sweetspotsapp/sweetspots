import { api } from '../client';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';
import { GetRecommendationsDto } from '../../dto/recommendations/get-recommendations.dto';
import { IRecommendedPlace } from '../../dto/recommendations/recommendation.dto';
import { UpdatePreferencesDto } from '../../dto/recommendations/update-preferences.dto';
import { GetRecContextDto } from '@/dto/recommendations/get-rec-context.dto';

export const getRecommendations = async (
  params?: GetRecommendationsDto
): Promise<ApiPluralResponse<IRecommendedPlace>> => {
  const res = await api.get('/recommendations', { params });
  return res.data;
};

export const updateTravelPreferences = async (
  data: UpdatePreferencesDto
): Promise<ApiResponse<{ success: boolean }>> => {
  const res = await api.post('/recommendations/preferences', data);
  return res.data;
};

export const getRecContext = async (data: GetRecContextDto): Promise<ApiResponse<string>> => {
  const res = await api.get('/recommendations/context', { params: data });
  return res.data;
};