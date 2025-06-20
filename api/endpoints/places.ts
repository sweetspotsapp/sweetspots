import { api } from '../client';

export const getAllPlaces = async () => {
  const res = await api.get('/places');
  return res.data;
};