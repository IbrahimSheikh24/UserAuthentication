import React from 'react';
import "../global.css";
import { AuthProvider } from '@/auth/context/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
