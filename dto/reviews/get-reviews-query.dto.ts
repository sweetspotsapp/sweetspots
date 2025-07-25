export class GetReviewsQueryDto {
  page: number = 1;
  limit: number = 20;
  placeId?: string;
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' = 'newest';
}