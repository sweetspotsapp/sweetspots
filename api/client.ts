import axios from 'axios';
import { getToken } from '@/utils/token';

export const api = axios.create({
  baseURL: 'https://your-api.com/api/v1',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});