
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
import mascot from '../assets/helper.png'; // 👈 Помести PNG-файл маскота сюда

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
  {
    name: 'React + TypeScript',
    icon: (
      <svg viewBox="0 0 256 256" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="28" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="16" fill="none">
          <ellipse rx="90" ry="32" cx="128" cy="128" transform="rotate(60 128 128)" />
          <ellipse rx="90" ry="32" cx="128" cy="128" transform="rotate(-60 128 128)" />
          <ellipse rx="90" ry="32" cx="128" cy="128" />
        </g>
      </svg>
    )
  },
  {
    name: 'TailwindCSS + Framer Motion',
    icon: (
      <svg viewBox="0 0 48 48" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path fill="#38BDF8" d="M24 4C12 4 8 16 16 16c2.5 0 4.1-1.5 5.6-3s2.8-3 5.4-3c3.6 0 5.9 2.5 7 7 1.1 4.5 1.7 10.5-1 14.5C30.5 36 27.2 40 22 40c-4.2 0-7.2-1.4-9-4-1.8-2.6-2.5-5.6-2.5-9h4.5c0 3.5 1 6 3 8 2 2 5 3 9 3s7.2-1.9 9-5.5c1.8-3.6 2-7.6 1-12C35 15.7 30.6 12 25 12c-2.8 0-4.4 1-5.9 2.5S16.6 18 14 18c-4 0-6-4-6-6C8 8 14 4 24 4z" />
      </svg>
    )
  },
  {
    name: 'Supabase (PostgreSQL + Auth)',
    icon: (
      <svg viewBox="0 0 256 256" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path fill="#3FCF8E" d="M128 0L0 256h128v-88l80-144H128z" />
      </svg>
    )
  },
  {
    name: 'OpenAI GPT API',
    icon: (
      <svg viewBox="0 0 256 256" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path fill="#10A37F" d="M128 0c35.3 0 64 28.7 64 64v128c0 35.3-28.7 64-64 64s-64-28.7-64-64V64C64 28.7 92.7 0 128 0z" />
      </svg>
    )
  },
  {
    name: 'Telegram Bot API',
    icon: (
      <svg viewBox="0 0 256 256" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0088CC" d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm58.5 83.7l-20.3 95.8c-1.5 6.9-5.5 8.6-11.1 5.4l-30.7-22.6-14.8 14.2c-1.6 1.6-2.9 2.9-5.9 2.9l2.1-30.2 55-49.5c2.4-2.1-.5-3.3-3.7-1.2l-68 42.8-29.3-9.1c-6.4-2-6.6-6.4 1.3-9.5l114-44.1c5.3-1.9 10 1.3 8.3 9z"/>
      </svg>
    )
  },
  {
    name: 'Spline 3D',
    icon: (
      <svg viewBox="0 0 256 256" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#7B61FF" />
        <path fill="#fff" d="M90 110c0-30 30-50 56-50s50 20 50 50-30 60-60 60c-10 0-16-4-20-8l-30 8 8-28c-4-6-4-12-4-16z" />
      </svg>
    )
  }
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
      {/* 3D фон */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Spline scene="https://prod.spline.design/IfGdHOiwVr6UVBXX/scene.splinecode" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 sm:px-6 md:px-10 py-10">
        {/* Хедер */}
        <div className="flex justify-between items-center mb-6">
          <div />
          <div className="flex flex-wrap justify-end gap-4">
            <button onClick={() => setShowResources(true)} className="text-sm underline hover:text-gray-300">Ресурсы</button>
            <button onClick={() => setShowStack(true)} className="text-sm underline hover:text-gray-300">Стек</button>
            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2">
                <img
                  src={generateAvatarUrl(user.email)}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md"
                />

                  <div className="text-left text-sm hidden sm:block">
                    <div>{user.email}</div>
                    <div className="text-gray-400 text-xs">{user.status || 'standard'}</div>
                  </div>
                </button>
                <button onClick={logout} className="px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black transition">Выйти</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition">Войти</button>
            )}
          </div>
        </div>

        {/* Главный блок */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-10 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl">
            Помогаем бизнесу<br />перестроиться под тренды
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-xl">
            Мы анализируем актуальные тренды, чтобы ваш бизнес быстро рос и адаптировался.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button onClick={() => navigate('/ideas')} className="px-6 py-3 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition">Перейти к идеям</button>
            {!user && (
              <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full border border-white text-white text-lg hover:bg-white hover:text-black transition">Зарегистрироваться</button>
            )}
          </div>
        </motion.div>

        {/* Подвал */}
        <div className="flex flex-wrap justify-between items-end mt-auto pt-16 text-xs text-gray-400">
          <div className="space-x-4 tracking-widest">
            <span>AI</span>
            <span>\ Telegram</span>
            <span>\ Business</span>
            <span>\ Trends</span>
          </div>
        </div>
      </div>

      {/* Кнопка "Связаться" в правом нижнем углу */}
      {!user && (
        <div className="fixed bottom-5 right-8 z-50">
          <div className="relative">
            <button
              onClick={() => setShowContact(prev => !prev)}
              className="bg-white text-black px-5 py-2 rounded-full shadow-lg hover:scale-105 transition"
            >
              Связаться
            </button>

            <AnimatePresence>
              {showContact && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg shadow-xl w-64 p-4 space-y-3"
                >
                  {/* Telegram */}
                  <div className="flex items-center gap-3 hover:bg-zinc-800 p-2 rounded transition">
                    <svg viewBox="0 0 256 256" className="w-5 h-5" fill="#0088CC">
                      <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm58.5 83.7l-20.3 95.8c-1.5 6.9-5.5 8.6-11.1 5.4l-30.7-22.6-14.8 14.2c-1.6 1.6-2.9 2.9-5.9 2.9l2.1-30.2 55-49.5c2.4-2.1-.5-3.3-3.7-1.2l-68 42.8-29.3-9.1c-6.4-2-6.6-6.4 1.3-9.5l114-44.1c5.3-1.9 10 1.3 8.3 9z"/>
                    </svg>
                    <a
                      href="https://t.me/yourusername"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Написать в Telegram
                    </a>
                  </div>

                  {/* Gmail */}
                  <div className="flex items-center gap-3 hover:bg-zinc-800 p-2 rounded transition">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#EA4335" d="M12 12.713l11.985-8.713H0z"/>
                      <path fill="#34A853" d="M12 12.713l-12-8.713v13.714z"/>
                      <path fill="#FBBC04" d="M12 12.713l12 8.714V4z"/>
                      <path fill="#4285F4" d="M12 12.713l-12 8.714h24z"/>
                    </svg>
                    <a
                      href="mailto:hello@yourdomain.com"
                      className="text-sm hover:underline"
                    >
                      Написать на Gmail
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Маскот и подсказки */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col items-start space-y-2 pointer-events-none">
        <motion.img
          src={mascot}
          alt="Mascot"
          initial={{ y: 0 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-20 h-20 drop-shadow-lg pointer-events-auto"
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="bg-white text-black rounded-lg px-4 py-2 shadow-lg text-sm max-w-xs pointer-events-auto"
            >
              <p>{hints[Math.floor(Math.random() * hints.length)]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      

      {/* Модалка: Stack */}
      <AnimatePresence>
        {showStack && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 text-white rounded-2xl p-8 shadow-2xl w-[90%] max-w-md relative"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
              <button onClick={() => setShowStack(false)} className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl">&times;</button>
              <h2 className="text-xl font-bold mb-6">Технологический стек</h2>
              <ul className="space-y-4 text-sm">
                {techStack.map(tech => (
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
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-900 text-white rounded-2xl p-8 shadow-2xl w-[90%] max-w-xl relative"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setShowResources(false)}
                className="absolute top-4 right-5 text-gray-400 hover:text-white text-xl"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-6">Источники и ресурсы</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {resources.map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition shadow hover:shadow-md"
                  >
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