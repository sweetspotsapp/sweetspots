import { api } from '../client';
import { IItinerary } from './dto/itinerary.dto';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { GetItinerariesQueryDto } from './dto/get-itineraries-query.dto';
import { PaginationResult } from '../pagination.dto';

export const getAllItineraries = async (
  params?: GetItinerariesQueryDto
): Promise<PaginationResult<IItinerary>> => {
  const res = await api.get('/itineraries', { params });
  return res.data;
};

export const getItineraryById = async (id: string): Promise<IItinerary> => {
  const res = await api.get(`/itineraries/${id}`);
  return res.data;
};

export const createItinerary = async (
  data: CreateItineraryDto
): Promise<IItinerary> => {
  const res = await api.post('/itineraries', data);
  return res.data;
};

export const updateItinerary = async (
  id: string,
  data: UpdateItineraryDto
): Promise<IItinerary> => {
  const res = await api.patch(`/itineraries/${id}`, data);
  return res.data;
};

export const deleteItinerary = async (
  id: string
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/itineraries/${id}`);
  return res.data;
};