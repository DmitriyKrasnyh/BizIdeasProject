// src/App.tsx
import React from 'react';

import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import { AnimatedRoutes } from './AnimatedRoutes'; // <-- маршруты
import './transitions.css'; // <-- стили анимации переходов

import { Navbar } from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <Navbar />
            <AnimatedRoutes /> {/* Проверяем, что этот компонент содержит маршрут /admin */}
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
