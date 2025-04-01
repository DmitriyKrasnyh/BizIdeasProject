import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Translations {
  [key: string]: string;
}

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ru'>('en');
  const [translations, setTranslations] = useState<{ [lang: string]: Translations }>({
    en: {},
    ru: {},
  });

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        console.log('📡 Загружаем переводы из Supabase...');
        const { data, error } = await supabase.from('translations').select('*');

        if (error) throw new Error(error.message);

        const grouped: { [lang: string]: Translations } = { en: {}, ru: {} };
        data?.forEach((row) => {
          if (!grouped[row.lang]) grouped[row.lang] = {};
          grouped[row.lang][row.key] = row.value;
        });

        setTranslations(grouped);
        console.log('✅ Переводы загружены из Supabase:', grouped);
      } catch (err) {
        console.error('❌ Ошибка загрузки переводов из Supabase:', err);
      }
    };

    loadTranslations();
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
