import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
    >
      <Languages className="h-4 w-4" />
      <span>{language.toUpperCase()}</span>
    </button>
  );
};