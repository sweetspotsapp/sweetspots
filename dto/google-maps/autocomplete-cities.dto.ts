// google-maps/dto/autocomplete-cities.dto.ts
export type PlacePrimaryType =
  | 'locality'
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'administrative_area_level_3';

/** Query DTO (e.g., for GET /maps/autocomplete-cities?input=Melb&country=AU&limit=6) */
export class AutocompleteCitiesQueryDto {
  input!: string;
  country?: string;
  limit?: number = 8;
}

/** One suggestion item */
export class CitySuggestionDto {
  placeId!: string;
  description!: string;
  primaryType?: PlacePrimaryType;
}

/** Response DTO wrapper */
export class AutocompleteCitiesResponseDto {
  suggestions!: CitySuggestionDto[];
}