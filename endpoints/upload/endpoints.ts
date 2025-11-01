import { api } from "../client";
import { ApiResponse } from "../pagination.dto";

export const getReadSas = async (blobPath: string): Promise<ApiResponse<{ url: string }>> => {
  const res = await api.post('/upload/read-sas', { blobPath });
  return res.data;
}