import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Spline from '@splinetool/react-spline';
import vcLogo from './logos/vc.jpg';
import habrLogo from './logos/habr.png';
import incLogo from './logos/inc.png';
import rbcLogo from './logos/rbc.png';
import rusbaseLogo from './logos/rusbase.png';
import mascot from '../assets/helper.png';

const generateAvatarUrl = (email: string) => {
  return `https://robohash.org/${encodeURIComponent(email)}?set=set1&size=80x80`;
};

const resources = [
  { name: 'VC.ru', logo: vcLogo, url: 'https://vc.ru/' },
  { name: 'Habr', logo: habrLogo, url: 'https://habr.com/' },
  { name: 'Inc. Russia', logo: incLogo, url: 'https://incrussia.ru/' },
  { name: 'RBK Тренды', logo: rbcLogo, url: 'https://trends.rbc.ru/' },
  { name: 'Rusbase', logo: rusbaseLogo, url: 'https://rb.ru/' },
];

const hints = [
  '👋 Привет! Нажми "Перейти к идеям", чтобы вдохновиться!',
  '🚀 Зарегистрируйся, чтобы сохранять понравившиеся идеи.',
  '💡 Мы анализируем тренды — ты просто выбираешь лучшие.'
];

const techStack = [
  { name: 'React + TypeScript', icon: <div className="text-xl">⚛️</div> },
  { name: 'TailwindCSS + Framer Motion', icon: <div className="text-xl">🎨</div> },
  { name: 'Supabase (PostgreSQL + Auth)', icon: <div className="text-xl">🛢️</div> },
  { name: 'OpenAI GPT API', icon: <div className="text-xl">🧠</div> },
  { name: 'Telegram Bot API', icon: <div className="text-xl">📲</div> },
  { name: 'Spline 3D', icon: <div className="text-xl">🔷</div> },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const [showWelcomeHint, setShowWelcomeHint] = useState(false);

  useEffect(() => {
    if (!user) {
      const timeout = setTimeout(() => setShowWelcomeHint(true), 3000);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Spline scene="https://prod.spline.design/IfGdHOiwVr6UVBXX/scene.splinecode" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 sm:px-6 md:px-10 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div />
          <div className="flex flex-wrap justify-end gap-4 w-full sm:w-auto">
            <button onClick={() => setShowResources(true)} className="text-sm underline hover:text-gray-300">Ресурсы</button>
            <button onClick={() => setShowStack(true)} className="text-sm underline hover:text-gray-300">Стек</button>
            {user ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2">
                  <img src={generateAvatarUrl(user.email)} alt="User Avatar" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md" />
                  <div className="text-left text-sm hidden sm:block">
                    <div>{user.email}</div>
                    <div className="text-gray-400 text-xs">{user.status || 'standard'}</div>
                  </div>
                </button>
                <button onClick={logout} className="px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black transition">Выйти</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="border border-white w-full sm:w-auto px-6 py-2 rounded-full hover:bg-white hover:text-black transition">Войти</button>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-6 sm:mt-10 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl">
            Помогаем бизнесу<br />перестроиться под тренды
          </h1>
          <p className="mt-6 text-sm sm:text-lg text-gray-300 max-w-xl">
            Мы анализируем актуальные тренды, чтобы ваш бизнес быстро рос и адаптировался.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
            <button onClick={() => navigate('/ideas')} className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition">Перейти к идеям</button>
            {!user && (
              <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-6 py-3 rounded-full border border-white text-white text-lg hover:bg-white hover:text-black transition">Зарегистрироваться</button>
            )}
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center sm:justify-between gap-2 mt-auto pt-10 text-xs text-gray-400 text-center">
          <div className="space-x-4 tracking-widest">
            <span>AI</span>
            <span>\ Telegram</span>
            <span>\ Business</span>
            <span>\ Trends</span>
          </div>
        </div>
      </div>

      {/* Маскот */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col items-start space-y-2 pointer-events-none">
        <motion.img
          src={mascot}
          alt="Mascot"
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg pointer-events-auto"
        />
        <button
          onClick={() => setShowWelcomeHint(true)}
          className="fixed bottom-10 left-4 z-50 bg-white text-black text-xs px-2 py-1 rounded-full shadow-lg hover:bg-gray-200 transition pointer-events-auto"
        >
          ?
        </button>
        <AnimatePresence>
          {showWelcomeHint && (
            <motion.div
              onClick={() => setShowWelcomeHint(false)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="bg-white text-black rounded-lg px-4 py-2 shadow-lg text-sm max-w-xs cursor-pointer pointer-events-auto"
            >
              <p>{hints[Math.floor(Math.random() * hints.length)]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Связаться */}
      {!user && (
        <div className="fixed bottom-5 right-4 z-50">
          <button onClick={() => setShowContact(!showContact)} className="bg-white text-black px-5 py-2 rounded-full shadow hover:scale-105 transition">
            Связаться
          </button>
          <AnimatePresence>
            {showContact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg shadow-xl w-64 p-4 space-y-3"
              >
                <div className="flex items-center gap-3 hover:bg-zinc-800 p-2 rounded transition">
                  <span className="text-lg">📨</span>
                  <a href="https://t.me/i6_dEv_9i" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">Telegram</a>
                </div>
                <div className="flex items-center gap-3 hover:bg-zinc-800 p-2 rounded transition">
                  <span className="text-lg">📧</span>
                  <a href="mailto:dimathedevoloper@gmail.com" className="text-sm hover:underline">Gmail</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Модалка: Stack */}
      <AnimatePresence>
        {showStack && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 text-white rounded-2xl p-8 shadow-2xl w-[90%] max-w-md relative" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
              <button onClick={() => setShowStack(false)} className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl">&times;</button>
              <h2 className="text-xl font-bold mb-6">Технологический стек</h2>
              <ul className="space-y-4 text-sm">
                {techStack.map((tech) => (
                  <li key={tech.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-lg shadow-md">
                      {tech.icon}
                    </div>
                    <span>{tech.name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка: Источники */}
      <AnimatePresence>
        {showResources && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 text-white rounded-2xl p-8 shadow-2xl w-[90%] max-w-xl relative" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
              <button onClick={() => setShowResources(false)} className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl">&times;</button>
              <h2 className="text-xl font-bold mb-6">Источники и ресурсы</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {resources.map((resource) => (
                  <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition shadow hover:shadow-md">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center mb-3">
                      <img src={resource.logo} alt={resource.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-medium text-center">{resource.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};