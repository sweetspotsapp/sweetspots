import { api } from '../client';
import { IReview } from './dto/review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { PaginationResult } from '../pagination.dto';

export const getReviews = async (
  params?: { placeId?: string; userId?: string; page?: number; limit?: number }
): Promise<PaginationResult<IReview>> => {
  const res = await api.get('/reviews', { params });
  return res.data;
};

export const postReview = async (
  data: CreateReviewDto
): Promise<IReview> => {
  const res = await api.post('/reviews', data);
  return res.data;
};