// src/lib/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  // @ts-ignore
  signInWithPopup,
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
  const firebaseUser = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await firebaseUser.user.getIdToken();
  api.defaults.headers.common.Authorization = `Bearer ${idToken}`;

  await api.post('/auth/sync-profile', {
    idToken,
    firstName,
    lastName,
    username,
  });

  await syncOnboardingAfterAuth();
  const cred = await login(email, password);
  return cred;
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

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const cred = await signInWithPopup(auth, provider);

    const idToken = await cred.user.getIdToken();
    api.defaults.headers.common.Authorization = `Bearer ${idToken}`;

    const displayName = cred.user.displayName || '';
    const [firstName = '', lastName = ''] = displayName.split(' ');
    const usernameFallback =
      cred.user.email?.split('@')[0] || cred.user.uid.slice(0, 8);

    await api.post('/auth/sync-profile', {
      idToken,
      firstName,
      lastName,
      username: usernameFallback,
    });

    await syncOnboardingAfterAuth();

    return cred;
  } catch (error) {
    console.error('Google login error:', error);
    // throw error;
  }
};