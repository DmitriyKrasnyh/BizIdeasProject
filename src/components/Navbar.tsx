// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-8 left-5 w-100 z-50 bg-transparent backdrop-blur-sm px-6 py-0">
      <Link to="/" className="flex items-center space-x-2">
        <Home className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-bold text-white">BizIdeas</span>
      </Link>
    </nav>
  );
};
