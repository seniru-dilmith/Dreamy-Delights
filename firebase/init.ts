// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dreamy-delights-882ff",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase services or set to null based on configuration
let app: any = null;
let analytics: any = null;
let db: any = null;
let storage: any = null;
let auth: any = null;
let functions: any = null;

// Validate required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn("Firebase configuration incomplete: Some environment variables are missing. Firebase services will not be available.");
} else {
  // Initialize Firebase only when configuration is complete
  app = initializeApp(firebaseConfig);
  // Only initialize analytics on client-side and if measurementId is provided
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
  functions = getFunctions(app);
}

// Export the services for use in other parts of your application
export { app, analytics, db, storage, auth, functions };
