// src/pages/Home.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, Home as HomeIcon } from 'lucide-react'; // ← Импорт иконки
import { Guide } from '../guide/Guide';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '72',   label: 'актуальные бизнес-идеи' },
  { value: '27 %', label: 'средний рост выручки клиентов' },
  { value: '5 мин',label: 'и готов черновик плана' },
];

function Home() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation(); // ← чтобы узнать текущий путь

  useEffect(() => {
    document.title = 'BizIdeas | Быстрый рост малого бизнеса';
  }, []);

  return (
    <>
      {/* ░░░ 2. Логотип-якорь на главной (/) ░░░ */}
      {pathname === '/' && (
        <div className="fixed top-4 left-4 z-[9999] pointer-events-auto">
          <Link to="/" className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1 rounded-full backdrop-blur-md">
            <HomeIcon className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-white">BizIdeas</span>
          </Link>
        </div>
      )}
  

      <Guide />
      <div className="relative min-h-screen flex flex-col bg-zinc-900 text-white overflow-hidden">
        {/* background pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="snow" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* header */}
        <header className="relative z-10 flex justify-end items-center h-14 px-4 sm:px-6">
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 text-sm border border-white/30 px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition">
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          ) : (
            <button id="login-btn" onClick={() => nav('/login')} className="text-sm border border-white px-5 py-1.5 rounded-full hover:bg-white hover:text-black transition">
              Войти
            </button>
          )}
        </header>

        {/* main */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-16 pt-24 sm:pt-28 md:pt-32">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-center leading-tight mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">Трендовые идеи.</span><br />
            Рост выручки без воды.
          </h1>

          <p className="max-w-md sm:max-w-lg mx-auto text-gray-300 text-base sm:text-lg text-center mb-12">
            BizIdeas подбирает конкретные шаги под свежие тренды — вы экономите время и растёте быстрее конкурентов.
          </p>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl w-full mb-12">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}
              >
                <span className="text-3xl sm:text-4xl font-bold text-indigo-300">{s.value}</span>
                <span className="mt-2 text-sm text-gray-300 text-center">{s.label}</span>
              </motion.div>
            ))}
          </section>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button id="ideas-btn" onClick={() => nav('/ideas')} className="px-8 sm:px-10 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 font-semibold hover:brightness-110 transition">
              Смотреть идеи
            </button>
            {!user && (
              <button onClick={() => nav('/register')} className="px-8 sm:px-10 py-3 rounded-full border border-white hover:bg-white hover:text-black transition">
                Регистрация
              </button>
            )}
          </div>
        </main>

        {/* footer */}
        <footer className="relative z-10 py-6 text-center text-[10px] sm:text-xs text-gray-500 px-4">
          Данные: VC.ru · Habr · Inc · РБК Тренды · Rusbase
        </footer>
      </div>
    </>
  );
}

export default Home;
export { Home };
