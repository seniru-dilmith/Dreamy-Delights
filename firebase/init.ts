// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, signInWithCustomToken, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase configuration from environment variables
// These values come from .env.local and are safe to expose to the frontend
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Validate that we have the required configuration
const isValidConfig = firebaseConfig.projectId && 
                     firebaseConfig.authDomain && 
                     firebaseConfig.apiKey &&
                     firebaseConfig.appId &&
                     !firebaseConfig.apiKey.includes('your_') &&
                     !firebaseConfig.appId.includes('your_');

// Initialize Firebase services
let app: any = null;
let analytics: any = null;
let functions: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let isFirebaseInitialized = false;

if (isValidConfig) {
  try {
    // Initialize Firebase with config from environment variables
    app = initializeApp(firebaseConfig);

    // Only initialize analytics on client-side
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    functions = getFunctions(app);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isFirebaseInitialized = true;
    console.info('Firebase initialized successfully with environment variables');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // Set to null if initialization fails
    app = null;
    analytics = null;
    functions = null;
    auth = null;
    db = null;
    storage = null;
    isFirebaseInitialized = false;
  }
} else {
  console.warn('Firebase not initialized: Missing or invalid configuration in environment variables');
  console.warn('Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set');
}

// Auth function wrappers - all authentication goes through Firebase Functions
export const authFunctions = {
  loginWithEmail: functions ? httpsCallable(functions, 'loginWithEmail') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  loginWithGoogle: functions ? httpsCallable(functions, 'loginWithGoogle') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  loginWithFacebook: functions ? httpsCallable(functions, 'loginWithFacebook') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  registerWithEmail: functions ? httpsCallable(functions, 'registerWithEmail') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  logout: functions ? httpsCallable(functions, 'logout') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  getCurrentUser: functions ? httpsCallable(functions, 'getCurrentUser') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  refreshToken: functions ? httpsCallable(functions, 'refreshToken') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  setUserRole: functions ? httpsCallable(functions, 'setUserRole') : () => Promise.reject(new Error('Firebase Functions not available: Please ensure your Firebase project is properly configured')),
  // Admin functions removed - use HTTP endpoints in firebase/api.ts instead
};

// Helper function to check if Firebase is properly initialized
export const isFirebaseReady = () => isFirebaseInitialized;

// Export Firebase client auth for token management
export { app, analytics, functions, auth, db, storage, signInWithCustomToken, signOut, onAuthStateChanged };
