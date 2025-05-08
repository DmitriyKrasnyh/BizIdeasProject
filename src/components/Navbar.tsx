// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Menu,
  X,
  Sprout,
  Bot,
  BarChart2,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/* ── основные пункты (админ-линк добавляем динамически) ── */
const BASE_LINKS = [
  { to: '/ideas',     label: 'Идеи',      icon: <Sprout className="w-4 h-4" /> },
  { to: '/assistant', label: 'AI',        icon: <Bot    className="w-4 h-4" /> },
  { to: '/analytics', label: 'Аналитика', icon: <BarChart2 className="w-4 h-4" /> },
  { to: '/pricing',    label: 'Подписки',  icon: <Zap className="w-4 h-4" /> }
];

/* ── утилита: бейдж с ролью ── */
const StatusBadge = ({ status }: { status: string }) => {
  /* один цвет — одна роль; можно расширять при желании */
  const styles: Record<string, string> = {
    admin:    'text-amber-400',
    plus:     'text-violet-400',
    standard: 'text-gray-400',
  };
  return (
    <span
      className={`${styles[status] ?? 'text-gray-400'} text-xs inline-flex items-center gap-1`}
    >
      {status === 'admin' && <ShieldCheck className="w-3 h-3" />}
      {status}
    </span>
  );
};

/* ── анимированное раскрытие mobile-меню ── */
const Collapse = ({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
      open ? 'max-h-[500px]' : 'max-h-0'
    }`}
  >
    {children}
  </div>
);

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.status === 'admin';
  const [open, setOpen] = useState(false);

  /* ░░░ 1. super-compact бар для /login и /register ░░░ */
  if (pathname === '/login' || pathname === '/register') {
    return (
      <header className="fixed top-0 inset-x-0 z-40 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Home className="w-5 h-5 text-indigo-500" />
            <span className="font-bold">BizIdeas</span>
          </Link>
          <span className="ml-auto text-sm text-gray-400 capitalize">
            {pathname === '/login' ? 'Вход' : 'Регистрация'}
          </span>
        </div>
      </header>
    );
  }

  /* ░░░ 2. только логотип-якорь на главной (/) ░░░ */
  if (pathname === '/') {
    return (
      <nav className="fixed top-8 left-5 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-white">BizIdeas</span>
        </Link>
      </nav>
    );
  }

  /* ░░░ 3. полноценный navbar на остальных страницах ░░░ */
  const navLinks = [
    ...BASE_LINKS,
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin', icon: <LayoutDashboard className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between
                        bg-black/60 backdrop-blur
                        rounded-b-xl shadow-xl shadow-purple-900/20 px-4">

          {/* ─ logo ─ */}
          <Link to="/" className="flex items-center gap-2 text-white">
            <Home className="w-5 h-5 text-indigo-500" />
            <span className="font-bold">BizIdeas</span>
          </Link>

          {/* ─ desktop-links ─ */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <NavItem
                key={link.to}
                {...link}
                active={pathname.startsWith(link.to)}
              />
            ))}
          </nav>

          {/* ─ user-area (desktop) ─ */}
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 hover:text-gray-300">
                <img
                  src={`https://robohash.org/${user.user_id}?set=set4&size=40x40`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="leading-tight text-sm">
                  <p>{user.email}</p>
                  <StatusBadge status={user.status ?? 'standard'} />
                </div>
              </Link>

              <button
                onClick={logout}
                title="Выйти"
                className="p-2 rounded-full border border-white/20 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─ burger ─ */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden text-white"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ─ mobile menu ─ */}
      <Collapse open={open}>
        <div className="md:hidden bg-black/90 backdrop-blur px-6 pb-6 space-y-4">
          {navLinks.map(link => (
            <NavItem
              key={link.to}
              {...link}
              active={pathname.startsWith(link.to)}
              onClick={() => setOpen(false)}
            />
          ))}

          {isAuthenticated && user && (
            <div className="pt-4 border-t border-white/10 flex items-start justify-between">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <img
                  src={`https://robohash.org/${user.user_id}?set=set4&size=40x40`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="leading-tight text-sm">
                  <p>{user.email}</p>
                  <StatusBadge status={user.status ?? 'standard'} />
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </Collapse>
    </header>
  );
};

/* ── отдельный пункт меню ── */
function NavItem({
  to,
  label,
  icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 text-sm ${
        active ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </NavLink>
  );
}
