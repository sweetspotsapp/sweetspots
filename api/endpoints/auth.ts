import { api } from '../client';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const signUp = async (name: string, email: string, password: string) => {
  const res = await api.post('/auth/signup', { name, email, password });
  return res.data;
};