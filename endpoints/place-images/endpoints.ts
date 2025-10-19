// src/lib/api/endpoints/place-images.ts

import { GetPlaceImagesDto } from '@/dto/place-images/get-place-images.dto';
import { api } from '../client';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';
import { CreatePlaceImageDto } from '@/dto/place-images/create-place-image.dto';
import { UpdatePlaceImageDto } from '@/dto/place-images/update-place-image.dto';
import { IPlaceImage } from '@/dto/places/place.dto';

export const getPlaceImages = async (
  params?: GetPlaceImagesDto
): Promise<ApiPluralResponse<IPlaceImage>> => {
  const res = await api.get('/place-images', { params });
  return res.data;
};

export const getImagesForPlace = async (
  placeId: string,
  params?: Omit<GetPlaceImagesDto, 'placeId'>
): Promise<ApiPluralResponse<IPlaceImage>> => {
  const res = await api.get('/place-images', {
    params: { placeId, ...(params ?? {}) },
  });
  return res.data;
};

export const createPlaceImage = async (
  data: CreatePlaceImageDto
): Promise<ApiResponse<IPlaceImage>> => {
  const res = await api.post('/place-images', data);
  return res.data;
};

export const getPlaceImageById = async (
  id: string
): Promise<ApiResponse<IPlaceImage>> => {
  const res = await api.get(`/place-images/${id}`);
  return res.data;
};

export const updatePlaceImage = async (
  id: string,
  data: UpdatePlaceImageDto
): Promise<ApiResponse<IPlaceImage>> => {
  const res = await api.patch(`/place-images/${id}`, data);
  return res.data;
};

export const deletePlaceImage = async (
  id: string
): Promise<ApiResponse<null>> => {
  const res = await api.delete(`/place-images/${id}`);
  return res.data;
};