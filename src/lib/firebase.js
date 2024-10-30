'use client'
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAWaHGuTaHBoPNpBjYLB7BsQ6nKaIcKpu8",
  authDomain: "campus-connect-c56a9.firebaseapp.com",
  projectId: "campus-connect-c56a9",
  storageBucket: "campus-connect-c56a9.appspot.com",
  messagingSenderId: "43653639488",
  appId: "1:43653639488:web:a345689e2b121b08115ea5",
  measurementId: "G-YMGVR3DHTY"
};

// Initialize Firebase only if not already initialized
const firebase_app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export { firebase_app };