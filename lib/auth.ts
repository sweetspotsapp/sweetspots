// lib/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from '@/api/client';
import { deleteToken } from '@/utils/token';

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

  await api.post('/auth/sync-profile', {
    idToken,
    firstName,
    lastName,
    username
  });
};

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => {
  deleteToken()
  signOut(auth)
};

export const loginWithGoogleCredential = (idToken: string) => {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};
