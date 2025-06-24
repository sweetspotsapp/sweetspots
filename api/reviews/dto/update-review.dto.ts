import { CreateReviewDto } from './create-review.dto';

export interface UpdateReviewDto extends Partial<Omit<CreateReviewDto, 'placeId'>> {}