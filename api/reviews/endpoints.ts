import { api } from '../client';
import { IReview } from './dto/review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiPluralResponse, ApiResponse, PaginationResult } from '../pagination.dto';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto';

export const getReviews = async (
  params?: GetReviewsQueryDto
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