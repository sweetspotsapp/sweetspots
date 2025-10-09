import { api } from "../client";
import { ApiPluralResponse, ApiResponse } from "../pagination.dto";
import { GetAppFeedbacksQueryDto } from "@/dto/app-feedbacks/get-app-feedbacks.dto";
import { CreateAppFeedbackDto } from "@/dto/app-feedbacks/create-app-feedback.dto";
import { UpdateAppFeedbackDto } from "@/dto/app-feedbacks/update-app-feedback.dto";
import { IAppFeedback } from "@/dto/app-feedbacks/app-feedback.dto";

export const getAppFeedbacks = async (
  params?: GetAppFeedbacksQueryDto
): Promise<ApiPluralResponse<IAppFeedback>> => {
  const res = await api.get("/app-feedbacks", { params });
  return res.data;
};

export const postAppFeedback = async (
  data: CreateAppFeedbackDto
): Promise<ApiResponse<IAppFeedback>> => {
  const res = await api.post("/app-feedbacks", data);
  return res.data;
};

export const getMyAppFeedbacks = async (
  params?: GetAppFeedbacksQueryDto
): Promise<ApiPluralResponse<IAppFeedback>> => {
  const res = await api.get("/app-feedbacks/me/list", { params });
  return res.data;
};

export const getAppFeedbackById = async (
  id: string
): Promise<ApiResponse<IAppFeedback>> => {
  const res = await api.get(`/app-feedbacks/${id}`);
  return res.data;
};

export const updateAppFeedback = async (
  id: string,
  data: UpdateAppFeedbackDto
): Promise<ApiResponse<IAppFeedback>> => {
  const res = await api.patch(`/app-feedbacks/${id}`, data);
  return res.data;
};

export const deleteAppFeedback = async (
  id: string
): Promise<ApiResponse<null>> => {
  const res = await api.delete(`/app-feedbacks/${id}`);
  return res.data;
};