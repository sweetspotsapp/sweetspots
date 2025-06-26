import { api } from '../client';
import { IPlace } from './dto/place.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { GetPlacesQueryDto } from './dto/get-places-query.dto';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';
import { CalculateDistanceDto } from './dto/calculate-distance.dto';

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

export const savePlace = async (
  id: string
): Promise<ApiResponse<{ success: boolean }>> => {
  const res = await api.post(`/places/${id}/save`);
  return res.data;
};

export const getSavedPlaces = async (): Promise<ApiResponse<IPlace[]>> => {
  const res = await api.get(`/places/saved/me`);
  return res.data;
};

export const syncPlacesInArea = async (
  latitude: number,
  longitude: number,
  radius?: number
): Promise<ApiResponse<{ syncedCount: number }>> => {
  const res = await api.post('/places/sync', {
    latitude,
    longitude,
    radius,
  });
  return res.data;
};

export const calculateTimeAndDistance = async (
  data: CalculateDistanceDto
): Promise<ApiResponse<{ distance: number; duration: number }>> => {
  const res = await api.post('/places/calculate-time-distance', data);
  return res.data;
};