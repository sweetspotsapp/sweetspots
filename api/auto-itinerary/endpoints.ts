import { api } from '../client';
import { ApiResponse } from '../pagination.dto';
import { CreateAutoItineraryDto } from '@/dto/auto-itinerary/create-auto-itinerary.dto';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';

export const createAutoItinerary = async (
  dto: CreateAutoItineraryDto
): Promise<ApiResponse<IItinerary>> => {
  const res = await api.post('/auto-itinerary/suggest', dto);
  return res.data;
};
