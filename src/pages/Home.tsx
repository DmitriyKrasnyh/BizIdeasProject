// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Spline from '@splinetool/react-spline';
import { Wrench, BookOpen, HelpCircle, LogOut, Lightbulb } from 'lucide-react';

/* ───── статичные ассеты ───── */
import vcLogo from './logos/vc.jpg';
import habrLogo from './logos/habr.png';
import incLogo from './logos/inc.png';
import rbcLogo from './logos/rbc.png';
import rusbaseLogo from './logos/rusbase.png';
import mascotPNG from '../assets/helper.png';

/* helpers */
const avatar = (e: string) =>
  `https://robohash.org/${encodeURIComponent(e)}?set=set1&size=80x80`;

/* данные */
const RESOURCES = [
  { name: 'VC.ru', logo: vcLogo, url: 'https://vc.ru/' },
  { name: 'Habr', logo: habrLogo, url: 'https://habr.com/' },
  { name: 'Inc. Russia', logo: incLogo, url: 'https://incrussia.ru/' },
  { name: 'RBK Тренды', logo: rbcLogo, url: 'https://trends.rbc.ru/' },
  { name: 'Rusbase', logo: rusbaseLogo, url: 'https://rb.ru/' },
];

const STACK = [
  'React + TypeScript',
  'TailwindCSS + Framer Motion',
  'Supabase (PostgreSQL + Auth)',
  'Mistral LLM (локально)',
  'Telegram Bot API',
  'Spline 3-D',
];

const HINTS = [
  '👋 Привет! Нажми «Перейти к идеям», чтобы вдохновиться.',
  '🚀 Зарегистрируйся, чтобы сохранять понравившиеся идеи.',
  '💡 Мы анализируем тренды — ты выбираешь лучшие.',
];

/* ─────────────────────────────────────────── */
export const Home: React.FC = () => {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  /* модалки */
  const [showRes, setShowRes] = useState(false);
  const [showStack, setShowStack] = useState(false);

  /* маскот-хинты */
  const [hintOpen, setHintOpen] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  useEffect(() => {
    const opener = setTimeout(() => setHintOpen(true), 2500);
    const rotator = setInterval(
      () => setHintIdx(i => (i + 1) % HINTS.length),
      8000, // ⏳ медленнее смена
    );
    return () => {
      clearTimeout(opener);
      clearInterval(rotator);
    };
  }, []);

  /* ─────────────── render ─────────────── */
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* ---------- 3-D фон (Spline) ---------- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Spline scene="https://prod.spline.design/IfGdHOiwVr6UVBXX/scene.splinecode" />
      </div>

      {/* ---------- Top-bar ---------- */}
      <div className="absolute top-5 right-6 flex items-center gap-4 text-sm z-30">
        {user ? (
          <>
            <button onClick={() => nav('/profile')}>
              <img
                src={avatar(user.email)}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-white object-cover hover:opacity-80 transition"
              />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full border border-white/30 hover:bg-white hover:text-black transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => nav('/login')}
            className="border border-white px-5 py-1.5 rounded-full hover:bg-white hover:text-black transition"
          >
            Войти
          </button>
        )}
      </div>

      {/* ---------- Hero-секция ---------- */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 px-6 pt-24 max-w-4xl"
      >
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 drop-shadow-md">
          Помогаем бизнесу <br /> перестроиться под&nbsp;тренды
        </h1>
        <p className="max-w-lg text-gray-300 sm:text-lg">
          Мы анализируем актуальные тренды, чтобы ваш бизнес быстро рос и
          адаптировался.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <MainBtn onClick={() => nav('/ideas')}>Перейти к идеям</MainBtn>
          {!user && (
            <OutlineBtn onClick={() => nav('/register')}>
              Зарегистрироваться
            </OutlineBtn>
          )}
        </div>
      </motion.section>

      {/* ---------- ключевые слова ---------- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-widest text-gray-400 select-none">
        AI \ Business \ Trends \ Telegram
      </div>

      

      {/* ---------- плавающие кнопки ---------- */}
      <FloatPanel
        onRes={() => setShowRes(true)}
        onStack={() => setShowStack(true)}
      />

      {/* ---------- Маскот ---------- */}
      <Mascot
        hint={HINTS[hintIdx]}
        open={hintOpen}
        onToggle={() => setHintOpen(v => !v)}
      />

      {/* ---------- Модалки ---------- */}
      <AnimatePresence>
        {showStack && (
          <Modal
            title="Технологический стек"
            onClose={() => setShowStack(false)}
          >
            <ul className="space-y-3 text-sm">
              {STACK.map(s => (
                <li
                  key={s}
                  className="flex items-start gap-3 bg-zinc-800 rounded-lg p-3 hover:bg-zinc-700 transition"
                >
                  <Wrench className="w-4 h-4 text-indigo-400 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </Modal>
        )}

        {showRes && (
          <Modal
            title="Источники и ресурсы"
            onClose={() => setShowRes(false)}
            width="max-w-xl"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {RESOURCES.map(r => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 transition"
                >
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={r.logo}
                      alt={r.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm">{r.name}</span>
                </a>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ───────── helpers ───────── */
const MainBtn = ({ children, onClick }: any) => (
  <button
    onClick={onClick}
    className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition"
  >
    {children}
  </button>
);

const OutlineBtn = ({ children, onClick }: any) => (
  <button
    onClick={onClick}
    className="px-8 py-3 rounded-full border border-white hover:bg-white hover:text-black transition"
  >
    {children}
  </button>
);

/* плавающие кнопки */
const FloatPanel = ({ onRes, onStack }: any) => (
  <div className="fixed right-6 bottom-8 flex flex-col gap-3 z-40">
    <FloatBtn
      dark
      label="Ресурсы"
      icon={<BookOpen className="w-4 h-4" />}
      onClick={onRes}
    />
    <FloatBtn
      gradient
      label="Стек"
      icon={<Wrench className="w-4 h-4" />}
      onClick={onStack}
    />
  </div>
);

const FloatBtn = ({
  label,
  icon,
  onClick,
  dark,
  gradient,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  dark?: boolean;
  gradient?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition
      ${dark ? 'bg-zinc-900/85 backdrop-blur hover:bg-zinc-800' : ''}
      ${gradient ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600' : ''}`}
  >
    {icon}
    {label}
  </button>
);

/* Маскот + хинты */
const Mascot = ({
  hint,
  open,
  onToggle,
}: {
  hint: string;
  open: boolean;
  onToggle: () => void;
}) => (
  <div className="fixed bottom-28 left-6 flex flex-col gap-3 items-start z-40">
    <motion.img
      src={mascotPNG}
      alt="bot"
      className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    />

    {/* switch-hint button */}
    <button
      onClick={onToggle}
      className="p-[6px] rounded-full bg-white text-black shadow hover:bg-gray-200 transition"
    >
      <HelpCircle className="w-4 h-4" />
    </button>

    {/* fancy hint bubble */}
    <AnimatePresence>
      {open && (
        <motion.div
          key={hint}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          <div className="absolute -left-1 bottom-full mb-1 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white" />
          <div className="bg-white text-black rounded-xl px-4 py-2 shadow-xl flex items-start gap-2 text-sm max-w-xs cursor-pointer"
               onClick={onToggle}>
            <Lightbulb className="w-4 h-4 mt-[2px] text-yellow-500 shrink-0" />
            <span>{hint}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* модалка */
const Modal = ({
  onClose,
  title,
  children,
  width = 'max-w-md',
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className={`bg-zinc-900 text-white rounded-2xl p-8 shadow-2xl w-[90%] ${width} relative`}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl"
      >
        &times;
      </button>
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      {children}
    </motion.div>
  </motion.div>
);
