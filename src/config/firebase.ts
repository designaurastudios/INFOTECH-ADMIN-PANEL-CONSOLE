import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC0D_fovNt7qCEMpIM_8sQu943cZLFDWu4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dental-hm-admin-dashboard.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dental-hm-admin-dashboard",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dental-hm-admin-dashboard.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "144186225406",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:144186225406:web:bad48d572efc9696bd6baf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NHEK3W1JNF",
};

const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const isFirebaseConfigured = true;
