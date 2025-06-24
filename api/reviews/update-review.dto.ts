import { CreateReviewDto } from './dto/create-review.dto';

export interface UpdateReviewDto extends Partial<Omit<CreateReviewDto, 'placeId'>> {}