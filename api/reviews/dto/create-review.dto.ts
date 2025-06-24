export interface CreateReviewDto {
  placeId: string;
  rating: number;
  comment?: string;
}