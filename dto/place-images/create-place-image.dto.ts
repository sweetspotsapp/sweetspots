export type PlaceImageSource = 'user' | 'google_maps' | 'system' | 'other';

export class CreatePlaceImageDto {
  placeId!: string;
  url!: string;
  description?: string;
  order?: number;
  uploadedBy?: string;
  source?: PlaceImageSource;
}