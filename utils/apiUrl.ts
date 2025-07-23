import * as Network from 'expo-network';
// import { Platform } from 'react-native';

export const getApiUrl = async (): Promise<string> => {
  const ip = await Network.getIpAddressAsync();

  // On iOS simulator, 'localhost' refers to your Mac
//   if (Platform.OS === 'ios' && !process.env.EXPO_NO_LOCALHOST) {
//     return 'http://localhost:8080';
//   }

  return `http://${ip}:8080`;
};