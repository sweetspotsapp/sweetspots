import { GetItinerariesQueryDto } from '@/dto/itineraries/get-itineraries-query.dto';
import { api } from '../client';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { CreateItineraryDto } from '@/dto/itineraries/create-itinerary.dto';
import { UpdateItineraryDto } from '@/dto/itineraries/update-itinerary.dto';

export const getAllItineraries = async (
  params?: GetItinerariesQueryDto
): Promise<ApiPluralResponse<IItinerary>> => {
  const res = await api.get('/itineraries', { params });
  return res.data;
};

export const getMyItineraries = async (
  params?: GetItinerariesQueryDto
): Promise<ApiPluralResponse<IItinerary>> => {
  const res = await api.get('/itineraries/me', { params });
  return res.data;
};

export const getItineraryById = async (
  id: string
): Promise<ApiResponse<IItinerary>> => {
  const res = await api.get(`/itineraries/${id}`);
  return res.data;
};

export const createItinerary = async (
  data: CreateItineraryDto
): Promise<ApiResponse<IItinerary>> => {
  const res = await api.post('/itineraries', data);
  return res.data;
};

export const updateItinerary = async (
  id: string,
  data: UpdateItineraryDto
): Promise<ApiResponse<IItinerary>> => {
  const res = await api.patch(`/itineraries/${id}`, data);
  return res.data;
};

export const deleteItinerary = async (
  id: string
): Promise<ApiResponse<{ success: boolean }>> => {
  const res = await api.delete(`/itineraries/${id}`);
  return res.data;
};

export const removeCollaborator = async ({
  itineraryId,
  userIdentity,
  userId,
}: {
  itineraryId: string;
  userIdentity?: string;
  userId?: string;
}): Promise<ApiResponse<any>> => {
  const res = await api.patch('/collab-itinerary/remove-collaborator', {
    itineraryId,
    userIdentity,
    userId,
  });
  return res.data;
};

export const addCollaborator = async ({
  itineraryId,
  userIdentity,
  userId,
}: {
  itineraryId: string;
  userIdentity?: string;
  userId?: string;
}): Promise<ApiResponse<any>> => {
  const res = await api.patch('/collab-itinerary/add-collaborator', {
    itineraryId,
    userIdentity,
    userId,
  });
  return res.data;
};
