// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDVsM2_t1iD52bKmhY8xA0dhV8FDGZoPZM",
  authDomain: "sweetspots-843ea.firebaseapp.com",
  projectId: "sweetspots-843ea",
  storageBucket: "sweetspots-843ea.firebasestorage.app",
  messagingSenderId: "927608663679",
  appId: "1:927608663679:web:3391dfd87dc2691b8d594a",
  measurementId: "G-6XPPR6M55W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
