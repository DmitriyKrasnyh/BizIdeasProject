import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageSwitcher } from './LanguageSwitcher';

// Иконки lucide-react
import {
  Home,
  Brain,
  User,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Состояние для анимации «кружочка»
  const [circleStyle, setCircleStyle] = useState<React.CSSProperties>({});
  const [showCircle, setShowCircle] = useState(false);

  // Функция выхода
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Цветовая плашка для статуса
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'admin':
        return 'bg-red-500 text-white';
      case 'plus':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white'; // standard
    }
  };

  // Анимация переключения темы «кружочком»
  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Определяем позицию клика
    const x = e.clientX;
    const y = e.clientY;

    // Настраиваем стили для "кружочка"
    setCircleStyle({
      left: x,
      top: y,
    });
    setShowCircle(true);

    // Делаем небольшую задержку, чтобы анимация «началась»
    setTimeout(() => {
      // Меняем тему
      toggleTheme();
    }, 150);

    // Скрываем кружочек после завершения анимации (~600ms)
    setTimeout(() => {
      setShowCircle(false);
    }, 600);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg relative z-50">
      {/* Встроенные стили для анимации круга. В реальном проекте лучше вынести в CSS */}
      <style>
        {`
          @keyframes circleExpand {
            0% {
              transform: scale(0);
              opacity: 0.6;
            }
            60% {
              opacity: 0.3;
            }
            100% {
              transform: scale(100);
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Кружок-анимация */}
      {showCircle && (
        <span
          className="pointer-events-none fixed w-4 h-4 rounded-full bg-blue-400 dark:bg-purple-500 animate-[circleExpand_0.6s_ease-out]"
          style={{
            ...circleStyle,
            transformOrigin: 'center',
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Левая часть: логотип/название */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xl text-gray-900 dark:text-gray-100">
              BizIdeas
            </span>
          </Link>

          {/* Правая часть: меню, переключатели */}
          <div className="flex items-center space-x-4">
            {/* Если пользователь залогинен */}
            {isAuthenticated ? (
              <>
                {/* Ссылка на Ideas */}
                <Link
                  to="/ideas"
                  className="inline-flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Brain className="h-5 w-5" />
                  <span>{t('ideas')}</span>
                </Link>

                {/* Блок «Profile + статус» */}
                <div className="flex items-center space-x-1">
                  <Link
                    to="/profile"
                    className="inline-flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <User className="h-5 w-5" />
                    <span>{t('profile')}</span>
                  </Link>
                  {/* Если есть user.status → показываем цветную плашку */}
                  {user?.status && (
                    <span
                      className={`
                        ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                        ${getStatusClasses(user.status)}
                      `}
                    >
                      {user.status}
                    </span>
                  )}
                </div>

                {/* Кнопка Logout */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('logout')}</span>
                </button>
              </>
            ) : (
              <>
                {/* Не залогинен: Login / Register */}
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span>{t('login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {t('register')}
                </Link>
              </>
            )}

            {/* Смена языка */}
            <LanguageSwitcher />

            {/* Кнопка переключения темы (с анимацией) */}
            <button
              onClick={handleThemeClick}
              className="relative p-2 rounded-md border border-gray-300 dark:border-gray-600 
                         hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300
                         transition-colors duration-200"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
