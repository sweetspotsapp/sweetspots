import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { loginWithGoogleCredential } from '@/lib/auth';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '<your-expo-client-id>.apps.googleusercontent.com',
    iosClientId: '<your-ios-client-id>.apps.googleusercontent.com',
    androidClientId: '<your-android-client-id>.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) loginWithGoogleCredential(idToken);
    }
  }, [response]);

  return { promptAsync };
};
