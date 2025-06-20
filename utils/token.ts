import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync('access_token', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('access_token');
};

export const deleteToken = async () => {
  await SecureStore.deleteItemAsync('access_token');
};