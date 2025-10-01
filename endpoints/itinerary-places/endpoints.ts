import { CreateItineraryPlaceDto } from '@/dto/itineraries/create-itinerary.dto';
import { api } from '../client';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { GetItineraryPlacesQueryDto } from '@/dto/itinerary-places/get-itinerary-places-query.dto';
import { UpdateItineraryPlaceDto } from '@/dto/itinerary-places/update-itinerary-place.dto';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';

export const createItineraryPlace = async (
  data: CreateItineraryPlaceDto
): Promise<ApiResponse<IItineraryPlace>> => {
  const res = await api.post('/itinerary-places', data);
  return res.data;
};

export const getAllItineraryPlaces = async (
  params?: GetItineraryPlacesQueryDto
): Promise<ApiPluralResponse<IItineraryPlace>> => {
  const res = await api.get('/itinerary-places', { params });
  return res.data;
};

export const getItineraryPlaceById = async (
  id: string
): Promise<ApiResponse<IItineraryPlace>> => {
  const res = await api.get(`/itinerary-places/${id}`);
  return res.data;
};

export const updateItineraryPlace = async (
  id: string,
  data: UpdateItineraryPlaceDto
): Promise<ApiResponse<IItineraryPlace>> => {
  const res = await api.patch(`/itinerary-places/${id}`, data);
  return res.data;
};

export const deleteItineraryPlace = async (
  id: string
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/itinerary-places/${id}`);
  return res.data;
};
