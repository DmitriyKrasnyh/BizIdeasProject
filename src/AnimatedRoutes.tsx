// src/AnimatedRoutes.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Ideas } from './pages/Ideas';
import { AdminPanel } from './pages/AdminPanel';


import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { useAuth } from './contexts/AuthContext';
import { Loader } from './components/Loader'; // 👈

export function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400); // Плавная задержка
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <Loader />}

      <TransitionGroup component={null}>
        <CSSTransition key={location.pathname} classNames="page" timeout={300}>
          <div className="page-transition-wrapper">
            <Routes location={location}>
              {/* Открытые маршруты */}
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/profile" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/profile" replace /> : <Register />}
              />
           

              {/* Защищённые маршруты */}
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
              <Route
                path="/ideas"
                element={<ProtectedRoute><Ideas /></ProtectedRoute>}
              />

              {/* Админ-панель */}
              <Route
                path="/admin"
                element={<AdminRoute><AdminPanel /></AdminRoute>}
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <h1 className="text-center text-2xl font-bold mt-10">
                    404: Страница не найдена
                  </h1>
                }
              />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}
