import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Public Firebase web-app configuration. Environment variables can override these
// defaults for preview/production deployments without changing source code.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCumN7xK4u0aoD1tQTLZ40B_8oP5VTTskA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quickrn-e4d45.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quickrn-e4d45",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quickrn-e4d45.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "400114977219",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:400114977219:web:98ba98c6215c702ec89576",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5K8CRLDX6K"
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);
export const firebaseApp = firebaseConfigured
  ? (getApps()[0] ?? initializeApp(config))
  : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
