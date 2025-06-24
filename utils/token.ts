// src/utils/token.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'access_token';

const isWeb = Platform.OS === 'web';

export const saveToken = async (token: string) => {
  if (isWeb) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

export const getToken = async () => {
  return isWeb
    ? await AsyncStorage.getItem(TOKEN_KEY)
    : await SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteToken = async () => {
  return isWeb
    ? await AsyncStorage.removeItem(TOKEN_KEY)
    : await SecureStore.deleteItemAsync(TOKEN_KEY);
};