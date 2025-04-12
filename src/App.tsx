// src/App.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import { AnimatedRoutes } from './AnimatedRoutes';
import { Navbar } from './components/Navbar';
import { Toaster } from 'react-hot-toast';

import './transitions.css';

function App() {
  const location = useLocation();

  // Пути, где нужно скрыть Navbar
  const hideNavbarPaths = ['/admin'];
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {!hideNavbar && <Navbar />}
            <AnimatedRoutes />
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
