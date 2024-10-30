'use client'
import React, { createContext, useContext } from 'react';
import { app as firebase_app, auth } from '../config/firebaseConfig.js';
const FirebaseContext = createContext();

export function FirebaseProvider({ children }) {
  return (
    <FirebaseContext.Provider value={{ app: firebase_app, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}