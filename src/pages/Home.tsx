// src/pages/Home.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';

import vcLogo from './logos/vc.jpg';
import habrLogo from './logos/habr.png';
import rusbaseLogo from './logos/rusbase.png';
import rbcLogo from './logos/rbc.png';
import incLogo from './logos/inc.png';

const resources = [
  { name: 'VC.ru', url: 'https://vc.ru', logo: vcLogo },
  { name: 'Habr', url: 'https://habr.com', logo: habrLogo },
  { name: 'Rusbase', url: 'https://rb.ru', logo: rusbaseLogo },
  { name: 'РБК Тренды', url: 'https://trends.rbc.ru', logo: rbcLogo },
  { name: 'Inc. Russia', url: 'https://incrussia.ru', logo: incLogo },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [showResources, setShowResources] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* 🔮 Фон */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Spline scene="https://prod.spline.design/IfGdHOiwVr6UVBXX/scene.splinecode" />
      </div>

      {/* 🧱 Контент */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-10 py-10">
        {/* Навигация */}
        <nav className="flex justify-between items-center mb-8 text-sm font-light">
          <div className="space-x-8">
            <button onClick={() => setShowResources(false)} className="hover:text-gray-300">Главная</button>
            <button onClick={() => navigate('/cases')} className="hover:text-gray-300">Кейсы</button>
            <button onClick={() => navigate('/library')} className="hover:text-gray-300">Библиотека</button>
            <button onClick={() => setShowResources(prev => !prev)} className="hover:text-gray-300">Ресурсы</button>
          </div>
          <button onClick={() => navigate('/login')} className="border px-6 py-2 rounded-full border-white hover:bg-white hover:text-black transition">
            Войти
          </button>
        </nav>

        {/* Заголовок */}
        <AnimatePresence>
          {!showResources && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-left max-w-4xl mt-20"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-xl">
                Помогаем бизнесу<br />перестроиться под тренды
              </h1>
              <p className="mt-6 text-lg max-w-xl text-gray-300">
                Мы анализируем актуальные новости и тренды, чтобы малый бизнес мог быстро адаптироваться и расти на волне перемен.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔄 Блок "Источники новостей" */}
        <AnimatePresence>
          {showResources && (
            <motion.div
              className="mt-10 px-4 py-8 backdrop-blur-xl bg-black/60 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Источники новостей</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 justify-items-center">
                {resources.map(site => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center hover:scale-105 transition-transform"
                  >
                    <div className="w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-md">
                      <img src={site.logo} alt={site.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="mt-3 text-sm text-gray-300 text-center">{site.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Теги и кнопки */}
        <div className="flex justify-between items-end mt-auto pb-10 text-xs">
          <div className="space-x-4 tracking-widest text-gray-400">
            <span>AI</span>
            <span>\ Telegram</span>
            <span>\ Business</span>
            <span>\ Trends</span>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => setShowContact(true)}
              className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition"
            >
              Связаться
            </button>
            <button
              onClick={() => navigate('/register')}
              className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>

      {/* 💬 Модалка «Связаться» */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-900 text-white rounded-lg p-8 shadow-xl w-[90%] max-w-md relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
                onClick={() => setShowContact(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">Связаться с нами</h2>
              <div className="space-y-4">
                <p>
                  📧 Email:{" "}
                  <a href="mailto:hello@yourdomain.com" className="text-blue-400 underline">
                    hello@yourdomain.com
                  </a>
                </p>
                <p>
                  💬 Telegram:{" "}
                  <a href="https://t.me/yourusername" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    @yourusername
                  </a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
