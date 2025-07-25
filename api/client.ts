import axios from 'axios';
import { getToken } from '@/utils/token';
import { router } from 'expo-router'; // or useRouter() inside component scope
import { Toast } from 'toastify-react-native';
import { Platform } from 'react-native';

const isDev = process.env.NODE_ENV === 'development';

// Replace this with your local machine's IP address

let baseURL = 'https://sweetspots-nest.onrender.com/api/v1';
export const API_URL = 'http://192.168.4.21:8080';

if (isDev) {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    baseURL = `${API_URL}/api/v1`;
  } else {
    // for web
    baseURL = `${API_URL}/api/v1`;
  }
}

export const api = axios.create({
  baseURL,
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
   if (error.response) {
      // Server responded with a status code outside 2xx
      const status = error.response.status;
      const message = error.response.data?.message || 'Unexpected error occurred';

      console.log('API Error:', {
        type: 'RESPONSE',
        status,
        message,
        baseURL,
        url: error.config?.url,
      });

      if (status === 401) {
        Toast.error('Session expired. Please log in again.');
        router.replace('/login');
      } else if (status === 403) {
        Toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        Toast.error('Server error. Please try again later.');
      } else {
        Toast.error(typeof message === 'string' ? message : 'Something went wrong.');
      }

    } else if (error.request) {
      // Request was made but no response received
      console.log('API Request Error:', {
        type: 'REQUEST',
        url: error.config?.url,
        method: error.config?.method,
        baseURL: baseURL,
        timeout: error.config?.timeout,
        headers: error.config?.headers,
        data: error.config?.data,
        message: error.message,
        error: error.toJSON(),
      });

      Toast.error('Network error. Please check your connection or server address.');
    } else {
      // Something else went wrong
      console.log('API Error:', {
        type: 'OTHER',
        message: error.message,
      });

      Toast.error('Unexpected error. Please try again.');
    }

    return Promise.reject(error);
  }
);