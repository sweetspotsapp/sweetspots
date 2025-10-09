export type AppFeedbacksSort =
  | 'newest'
  | 'oldest';

export class GetAppFeedbacksQueryDto {
  page: number = 1;
  limit: number = 20;
  userId?: string;
  sortBy: AppFeedbacksSort = 'newest';
  createdFrom?: string;
  createdTo?: string;
}