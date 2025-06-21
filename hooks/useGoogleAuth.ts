import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useRef, useState } from 'react';
import { loginWithGoogleCredential } from '@/lib/auth';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '<your-expo-client-id>.apps.googleusercontent.com',
    iosClientId: '<your-ios-client-id>.apps.googleusercontent.com',
    androidClientId: '<your-android-client-id>.apps.googleusercontent.com',
  });

  const loginPromise = useRef<Promise<any> | null>(null);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        loginPromise.current = loginWithGoogleCredential(idToken).catch((err) => {
          setAuthError(err);
        });
      }
    }
  }, [response]);

  const loginAsync = async () => {
    const res = await promptAsync();
    if (res.type === 'success' && loginPromise.current) {
      await loginPromise.current;
    } else if (res.type === 'error') {
      throw new Error('Google login was cancelled or failed');
    }
  };

  return {
    promptAsync: loginAsync,
    authError,
  };
};