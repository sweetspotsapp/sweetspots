// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  // For web
  console.log('Initializing Firebase Auth for web', firebaseConfig);
  auth = getAuth(app);
} else {
  // For native (iOS/Android)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };