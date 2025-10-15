// import * as Google from 'expo-auth-session/providers/google';
// import { useEffect, useRef, useState } from 'react';
// import { loginWithGoogleCredential } from '@/lib/auth';
// import Constants from 'expo-constants';

// const {
//   GOOGLE_EXPO_CLIENT_ID,
//   GOOGLE_IOS_CLIENT_ID,
//   GOOGLE_ANDROID_CLIENT_ID,
// } = Constants.expoConfig?.extra || {};

// export const useGoogleAuth = () => {
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     clientId: GOOGLE_EXPO_CLIENT_ID,
//     iosClientId: GOOGLE_IOS_CLIENT_ID,
//     androidClientId: GOOGLE_ANDROID_CLIENT_ID,
//   });

//   const loginPromise = useRef<Promise<any> | null>(null);
//   const [authError, setAuthError] = useState<Error | null>(null);

//   useEffect(() => {
//     if (response?.type === 'success') {
//       const idToken = response.authentication?.idToken;
//       if (idToken) {
//         loginPromise.current = loginWithGoogleCredential(idToken).catch((err) => {
//           setAuthError(err);
//         });
//       }
//     }
//   }, [response]);

//   const loginAsync = async () => {
//     const res = await promptAsync();
//     if (res.type === 'success' && loginPromise.current) {
//       await loginPromise.current;
//     } else if (res.type === 'error') {
//       throw new Error('Google login was cancelled or failed');
//     }
//   };

//   return {
//     promptAsync: loginAsync,
//     authError,
//   };
// };