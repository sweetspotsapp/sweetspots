import { api } from '../client';
import { IPlace } from './dto/place.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { GetPlacesQueryDto } from './dto/get-places-query.dto';
import { ApiPluralResponse, ApiResponse, PaginationResult } from '../pagination.dto';

export const getAllPlaces = async (
  params?: GetPlacesQueryDto
): Promise<ApiPluralResponse<IPlace>> => {
  const res = await api.get('/places', { params });
  return res.data;
};

export const getPlaceById = async (id: string): Promise<ApiResponse<IPlace>> => {
  const res = await api.get(`/places/${id}`);
  return res.data;
};

export const createPlace = async (
  data: CreatePlaceDto
): Promise<ApiResponse<IPlace>> => {
  const res = await api.post('/places', data);
  return res.data;
};

export const updatePlace = async (
  id: string,
  data: UpdatePlaceDto
): Promise<ApiResponse<IPlace>> => {
  const res = await api.patch(`/places/${id}`, data);
  return res.data;
};

export const deletePlace = async (
  id: string
): Promise<ApiResponse<{ success: boolean }>> => {
  const res = await api.delete(`/places/${id}`);
  return res.data;
};