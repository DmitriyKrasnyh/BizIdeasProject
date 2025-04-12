import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-black to-indigo-900 opacity-30 blur-3xl pointer-events-none" />
      <div className="z-10 w-full max-w-md space-y-8 bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-800">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Вход в аккаунт</h2>
          <p className="text-sm text-gray-400">Введи почту и пароль, чтобы продолжить</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Пароль</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-600 outline-none transition"
              required
            />
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
            <span onClick={() => navigate('/')} className="text-blue-400 hover:underline cursor-pointer">
              ⬅ Назад на главную
            </span>
          </p>
        </div>
      </div>

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
    </div>
  );
};
