import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

const {
  GOOGLE_EXPO_CLIENT_ID
} = Constants.expoConfig?.extra || {};

GoogleSignin.configure({
  webClientId: GOOGLE_EXPO_CLIENT_ID,
});

import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';

export async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const signInResult = await GoogleSignin.signIn();

  // Try the new style of google-sign in result, from v13+ of that module
  let idToken = signInResult.data?.idToken;
  if (!idToken) {
    // if you are using older versions of google-signin, try old style result
    idToken = signInResult.data?.idToken;
  }
  if (!idToken) {
    throw new Error('No ID token found');
  }

  // Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), googleCredential);
}