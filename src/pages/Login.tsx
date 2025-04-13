import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import mascot from '../assets/helper.png'; // убедись, что путь верный

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hints = [
    '👋 Привет! Введи почту и пароль — и мы покажем тебе крутые идеи!',
    '🔒 Забыл пароль? Нажми на ссылку — и всё восстановим!',
    '📩 Убедись, что почта указана правильно, чтобы не потерять доступ.'
  ];
  const [showMascotHint, setShowMascotHint] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowMascotHint(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Введите email и пароль');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(formData.email, formData.password);
      toast.success('Успешный вход');
      navigate(loggedInUser?.status === 'admin' ? '/admin' : '/profile');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!forgotEmail) {
      toast.error('Введите email');
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset`,
    });

    if (error) toast.error('Ошибка при отправке письма');
    else {
      toast.success('Ссылка на восстановление отправлена');
      setShowForgotModal(false);
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 sm:px-6 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-black to-indigo-900 opacity-30 blur-3xl pointer-events-none" />

      <div className="z-10 w-full max-w-md sm:rounded-2xl bg-[#111827] p-6 sm:p-8 shadow-xl border border-gray-800 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Вход в аккаунт</h2>
          <p className="text-sm text-gray-400">Введи почту и пароль, чтобы продолжить</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-600 outline-none transition"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Пароль</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 pr-10 bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-600 outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-8 right-3 text-gray-400 hover:text-white"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-sm text-right text-blue-400 cursor-pointer hover:underline" onClick={() => setShowForgotModal(true)}>
            Забыли пароль?
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-700 text-sm text-center text-gray-400 space-y-2">
          <p>
            Нет аккаунта?{' '}
            <span onClick={() => navigate('/register')} className="text-blue-400 hover:underline cursor-pointer">
              Зарегистрироваться
            </span>
          </p>
          <p>
            <span onClick={() => navigate('/')} className="text-blue-400 hover:underline cursor-pointer flex items-center justify-center gap-1">
              ⬅ Назад на главную
            </span>
          </p>
        </div>
      </div>

      {/* Модалка восстановления пароля */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">🔐 Восстановление пароля</h3>
            <p className="text-sm text-gray-400">Мы отправим письмо со ссылкой на восстановление</p>
            <input
              type="email"
              placeholder="Введите email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-700 font-medium"
              >
                {resetLoading ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : 'Отправить'}
              </button>
              <button
                onClick={() => setShowForgotModal(false)}
                className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Маскот с подсказкой */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col items-start space-y-2 pointer-events-none">
        <motion.img
          src={mascot}
          alt="Mascot"
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-16 h-16 drop-shadow-lg pointer-events-auto"
        />
        <button
          onClick={() => setShowMascotHint(true)}
          className="fixed bottom-10 left-4 z-50 bg-white text-black text-xs px-2 py-1 rounded-full shadow-lg hover:bg-gray-200 transition pointer-events-auto"
        >
          ?
        </button>
        <AnimatePresence>
          {showMascotHint && (
            <motion.div
              onClick={() => setShowMascotHint(false)} // 👈 скрытие по клику
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

    </div>
  );
};
