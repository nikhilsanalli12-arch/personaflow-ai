import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PersonalizationProvider>
          <AppRoutes />
        </PersonalizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
