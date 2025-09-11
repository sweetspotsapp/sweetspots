import { api } from '../client';
import { ApiResponse } from '../pagination.dto';
import { AutocompleteCitiesQueryDto, CitySuggestionDto } from '@/dto/google-maps/autocomplete-cities.dto';

export const getAutocompleteCities = async (
  params?: AutocompleteCitiesQueryDto
): Promise<ApiResponse<CitySuggestionDto[]>> => {
  const res = await api.get('/maps/autocomplete-cities', { params });
  return res.data;
};
