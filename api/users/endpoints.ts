import { api } from '../client';
import { ApiResponse } from '../pagination.dto';
import { IUserProfile } from './dto/user-profile.dto'; // Assume you have this DTO

export const getCurrentUserProfile = async (): Promise<ApiResponse<IUserProfile>> => {
    const res = await api.get('/auth/profile');
    return res.data;
};