'use client'
import React from 'react';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { ShoppingProvider } from '@/context/ShoppingContext';
import { FirebaseProvider } from '@/context/FirebaseContext';
import { UserProvider } from '@/context/UserContext';
import Header from '@/components/Header'; // Move Header to a separate component file
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('darkMode') === 'true' ||
                    (!('darkMode' in localStorage))) {
                  document.documentElement.classList.add('dark')
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <FirebaseProvider>
          <UserProvider>
            <DarkModeProvider>
              <ShoppingProvider>
                <div className="min-h-screen">
                  <Header />
                  <main>
                    {children}
                  </main>
                </div>
              </ShoppingProvider>
            </DarkModeProvider>
          </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}