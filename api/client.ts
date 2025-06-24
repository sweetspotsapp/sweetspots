import axios from 'axios';
import { getToken } from '@/utils/token';
import { router } from 'expo-router'; // or useRouter() inside component scope
import { Toast } from 'toastify-react-native';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: adds token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Unexpected error occurred';

    if (status === 401) {
      Toast.error('Session expired. Please log in again.');
      router.replace('/login');
    } else if (status === 403) {
      Toast.error('You do not have permission to perform this action.');
    } else if (status >= 500) {
      Toast.error('Server error. Please try again later.');
    } else if (status >= 400) {
      Toast.error(typeof message === 'string' ? message : 'Something went wrong.');
    }

    return Promise.reject(error);
  }
);