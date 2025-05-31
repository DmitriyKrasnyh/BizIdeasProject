// src/AnimatedRoutes.tsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

/* pages */
import { Home }          from './pages/Home';
import { Login }         from './pages/Login';
import { Register }      from './pages/Register';
import { Profile }       from './pages/Profile';
import  Ideas            from './pages/Ideas';
import { Analytics }     from './pages/Analytics';
import { Assistant }     from './pages/Assistant';
import { AdminPanel }    from './pages/AdminPanel';
import { ResetPassword } from './pages/ResetPassword';
import { Pricing }       from './pages/Pricing';
import { Faq }           from './pages/Faq'
import { SuggestIdea }   from './pages/IdeasSubmissionAndModeration'
import { ModerateIdeas } from './pages/IdeasSubmissionAndModeration'

/* guards & ui */
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute }     from './components/AdminRoute';
import { Loader }         from './components/Loader';
import { useAuth }        from './contexts/AuthContext';


/* ───────── CSS for cross-fade (inject once) ─────────
   .route-enter  { @apply opacity-0 scale-[0.98]; }
   .route-enter-active,
   .route-enter-done { @apply opacity-100 scale-100 transition-all duration-300 ease-out; }
   .route-exit  { @apply opacity-100 scale-100; }
   .route-exit-active { @apply opacity-0 scale-[0.98] transition-all duration-200 ease-in; }
   .page-shell { @apply min-h-screen pt-20; }           ←  keeps offset under navbar
   (Tailwind jit will pick up these classes)
------------------------------------------------------------------ */

export function AnimatedRoutes() {
  const location              = useLocation();
  const { isAuthenticated }   = useAuth();
  const [loading, setLoading] = useState(false);

  /* короткая блокирующая «загрузка» между переходами */
  useEffect(() => {
    setLoading(true);
    const tm = setTimeout(() => setLoading(false), 280);
    return () => clearTimeout(tm);
  }, [location.pathname]);

  return (
    <>
      {loading && <Loader />}

      {/* graceful cross-fade between routes */}
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          classNames="route"
          timeout={{ enter: 300, exit: 200 }}
          unmountOnExit
        >
          <div className="page-shell">
            <Routes location={location}>
              {/* public */}
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/profile" replace /> : <Login />
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? <Navigate to="/profile" replace /> : <Register />
                }
              />
              <Route path="/reset" element={<ResetPassword />} />

              {/* informational (открытые) */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/pricing"   element={<Pricing />} />

              {/* protected */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ideas"
                element={
                  <ProtectedRoute>
                    <Ideas />
                  </ProtectedRoute>
                }
              />

              {/* admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
              <Route path="/suggest-idea" element={<SuggestIdea />} />
              <Route path="/moderate-ideas" element={<ModerateIdeas />} />   {/* admin only */}
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/faq" element={<Faq />} />
              {/* 404 fallback */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-[70vh] text-white text-3xl font-bold">
                    404 &nbsp;—&nbsp; Страница не найдена
                  </div>
                }
              />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}
