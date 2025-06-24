
export class GetItinerariesQueryDto {
  page: number = 1;
  limit: number = 20;
  isPublic?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'name' = 'newest';
}