// lib/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from '@/endpoints/client';
import { deleteToken } from '@/utils/token';
import { syncOnboardingAfterAuth } from './onboardingSync';

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  username: string
) => {
  const firebaseUser = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const idToken = await firebaseUser.user.getIdToken();
  api.defaults.headers.common.Authorization = `Bearer ${idToken}`;

  await api.post('/auth/sync-profile', {
    idToken,
    firstName,
    lastName,
    username,
  });

  await syncOnboardingAfterAuth();
};

export const login = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  api.defaults.headers.common.Authorization = `Bearer ${idToken}`;
  await syncOnboardingAfterAuth();
  return cred;
};

export const logout = () => {
  deleteToken();
  signOut(auth);
};

export const loginWithGoogleCredential = async (idToken: string) => {
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth, credential);
  const fresh = await cred.user.getIdToken();
  api.defaults.headers.common.Authorization = `Bearer ${fresh}`;

  await syncOnboardingAfterAuth();
  return cred;
};
