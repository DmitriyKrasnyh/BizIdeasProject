// src/components/Loader.tsx
import React from 'react';

/**
 * Radial “Aurora” loader — sits on top of everything while data are fetched.
 * Size / colors are pure Tailwind; tweak freely if you want another vibe ✨
 */
export const Loader: React.FC<{ label?: string }> = ({ label = 'Загрузка…' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur">
    {/* glow */}
    <div className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-600 to-pink-600 opacity-40 blur-3xl animate-pulse" />

    {/* spinner */}
    <div className="relative">
      <div className="w-16 h-16 border-4 border-transparent border-t-white rounded-full animate-spin" />
      <div className="absolute inset-0 m-1 rounded-full border-4 border-indigo-500 opacity-20" />
    </div>

    {/* optional text */}
    <p className="mt-6 text-sm text-gray-200 tracking-wide animate-pulse">{label}</p>
  </div>
);
