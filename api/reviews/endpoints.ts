import { api } from '../client';
import { IReview } from './dto/review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiPluralResponse, ApiResponse, PaginationResult } from '../pagination.dto';

export const getReviews = async (
  params?: { placeId?: string; userId?: string; page?: number; limit?: number }
): Promise<ApiPluralResponse<IReview>> => {
  const res = await api.get('/reviews', { params });
  return res.data;
};

export const postReview = async (
  data: CreateReviewDto
): Promise<ApiResponse<IReview>> => {
  const res = await api.post('/reviews', data);
  return res.data;
};