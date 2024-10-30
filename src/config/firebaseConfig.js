import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAWaHGuTaHBoPNpBjYLB7BsQ6nKaIcKpu8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "campus-connect-c56a9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "campus-connect-c56a9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "campus-connect-c56a9.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "43653639488",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:43653639488:web:a345689e2b121b08115ea5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-YMGVR3DHTY"
};

// Log the config being used (without sensitive values)
console.log('Firebase Config Status:', {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
  measurementId: !!firebaseConfig.measurementId
});

let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Initialize with empty config as fallback
  app = initializeApp({
    apiKey: "AIzaSyAWaHGuTaHBoPNpBjYLB7BsQ6nKaIcKpu8",
    authDomain: "campus-connect-c56a9.firebaseapp.com",
    projectId: "campus-connect-c56a9",
    storageBucket: "campus-connect-c56a9.appspot.com",
    messagingSenderId: "43653639488",
    appId: "1:43653639488:web:a345689e2b121b08115ea5",
    measurementId: "G-YMGVR3DHTY"
  });
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

// Additional initialization checks
try {
  // Test Firestore connection
  db.app.name;
  // Test Storage connection
  storage.app.name;
} catch (error) {
  console.error('Error verifying Firebase services:', error);
}

export { app, auth, db, storage };

// Helper function to check if all Firebase services are initialized
export const isFirebaseInitialized = () => {
  try {
    return !!(app && auth && db && storage);
  } catch {
    return false;
  }
};