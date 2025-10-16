import { CollabItineraryRoomDto } from "@/dto/collab-itineraries/collab-itinerary-room.dto";
import { api } from "../client";
import { ApiResponse } from "../pagination.dto";
import { IItineraryUser } from "@/dto/itinerary-users/itinerary-user.dto";

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

export const getActiveCollaborators = async (itineraryId: string): Promise<ApiResponse<CollabItineraryRoomDto[]>> => {
    const res = await api.get(`/collab-itinerary/${itineraryId}/active`);
    return res.data;
};

export const getItineraryCollaborators = async (itineraryId: string): Promise<ApiResponse<IItineraryUser[]>> => {
    const res = await api.get(`/collab-itinerary/${itineraryId}`);
    return res.data;
};

export const updateSuggestionStatus = async (
    suggestionId: string,
    status: "accepted" | "rejected"
): Promise<ApiResponse<any>> => {
    const res = await api.patch(`/collab-itinerary/suggestions/${suggestionId}`, { status });
    return res.data;
};