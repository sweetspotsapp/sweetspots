import { GetReviewsQueryDto } from '@/dto/reviews/get-reviews-query.dto';
import { api } from '../client';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';
import { CreateReviewDto } from '@/dto/reviews/create-review.dto';
import { IReview } from '@/dto/reviews/review.dto';
import { UpdateReviewDto } from '@/dto/reviews/update-review.dto';

// GET /reviews (with filters & pagination)
export const getReviews = async (
  params?: GetReviewsQueryDto
): Promise<ApiPluralResponse<IReview>> => {
  const res = await api.get('/reviews', { params });
  return res.data;
};

// POST /reviews
export const postReview = async (
  data: CreateReviewDto
): Promise<ApiResponse<IReview>> => {
  const res = await api.post('/reviews', data);
  return res.data;
};

// GET /reviews/me
export const getMyReviews = async (
  params?: GetReviewsQueryDto
): Promise<ApiPluralResponse<IReview>> => {
  const res = await api.get('/reviews/me', { params });
  return res.data;
};

// GET /reviews/place/:placeId
export const getPlaceReviews = async (
  placeId: string,
  params?: GetReviewsQueryDto
): Promise<ApiPluralResponse<IReview>> => {
  const res = await api.get(`/reviews/place/${placeId}`, { params });
  return res.data;
};

// GET /reviews/:id
export const getReviewById = async (
  id: string
): Promise<ApiResponse<IReview>> => {
  const res = await api.get(`/reviews/${id}`);
  return res.data;
};

// PATCH /reviews/:id
export const updateReview = async (
  id: string,
  data: UpdateReviewDto
): Promise<ApiResponse<IReview>> => {
  const res = await api.patch(`/reviews/${id}`, data);
  return res.data;
};

// DELETE /reviews/:id
export const deleteReview = async (
  id: string
): Promise<ApiResponse<null>> => {
  const res = await api.delete(`/reviews/${id}`);
  return res.data;
};

// POST /reviews/:id/helpful
export const markReviewHelpful = async (
  id: string
): Promise<ApiResponse<{ helpful: number }>> => {
  const res = await api.post(`/reviews/${id}/helpful`);
  return res.data;
};