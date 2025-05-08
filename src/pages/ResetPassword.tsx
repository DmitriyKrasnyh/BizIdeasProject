import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    document.title = "BizIdeas | Востановление пароля";
    // Supabase автоматически вставляет токен в localStorage при переходе по ссылке с #access_token
    const hash = window.location.hash;
    const hasAccessToken = hash.includes('access_token');
    if (hasAccessToken) {
      setTokenReady(true);
    } else {
      toast.error('⛔ Не найден токен восстановления.');
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Пароль слишком короткий');
    if (password !== confirm) return toast.error('Пароли не совпадают');

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.custom(() => (
        <div className="bg-red-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 border border-red-700">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Ошибка: {error.message}</span>
        </div>
      ));
    } else {
      toast.custom(() => (
        <div className="bg-green-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 border border-green-700">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>Пароль успешно обновлен</span>
        </div>
      ));
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col justify-center px-6 py-20">
      <div className="max-w-md w-full mx-auto bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800">
        <div className="text-center mb-6">
          <KeyRound className="w-10 h-10 mx-auto mb-2 text-yellow-400" />
          <h1 className="text-2xl font-bold">Смена пароля</h1>
          <p className="text-sm text-gray-400 mt-1">Введите новый пароль ниже</p>
        </div>

        {tokenReady ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm mb-1">Новый пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Повторите пароль</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Обновление...
                </>
              ) : (
                'Обновить пароль'
              )}
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-400">⏳ Проверка токена...</p>
        )}
      </div>
    </div>
  );
};
