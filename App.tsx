import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { initializeFirebase } from './src/config/firebase.config';
import { FirebaseProvider } from './src/context/FirebaseContext';
import { UserProvider } from './src/context/UserContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <PaperProvider>
      <FirebaseProvider>
        <UserProvider>
          <AppNavigator />
        </UserProvider>
      </FirebaseProvider>
    </PaperProvider>
  );
} 