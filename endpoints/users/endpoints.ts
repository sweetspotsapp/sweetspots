import { api } from '../client';
import { ApiPluralResponse, ApiResponse } from '../pagination.dto';
import { IUserProfile } from '../../dto/users/user-profile.dto'; // Assume you have this DTO
import { GetUserProfilesDto } from '@/dto/users/get-user-profiles.dto';

export const getUserProfiles = async (
    params: GetUserProfilesDto
): Promise<ApiPluralResponse<IUserProfile>> => {
    const res = await api.get('/users', { params });
    return res.data;
};

export const getCurrentUserProfile = async (): Promise<ApiResponse<IUserProfile>> => {
    const res = await api.get('/auth/profile');
    return res.data;
};

export const getUserProfileById = async (userId: string): Promise<ApiResponse<IUserProfile>> => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
};