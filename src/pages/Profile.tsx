
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  REGIONS,
  BUSINESS_SECTORS,
  TRANSITION_GOALS,
  EXPERIENCE_LEVELS
} from '../contexts/constants.ts';

const generateAvatarUrl = (email: string) => {
  return `https://robohash.org/${encodeURIComponent(email)}?set=set1&size=150x150`;
};

const loadingPhrases = [
  'Считаем котов...',
  'Взламываем Пентагон...',
  'Собираем нейросеть...',
  'Оптимизируем бизнес...',
  'Генерируем гениальные идеи...',
  'Синхронизируем Бали с космосом...',
  'Проводим ретрит в фоновом режиме...'
];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [profileData, setProfileData] = useState({
    region: '',
    businessSector: '',
    transitionGoal: '',
    experienceLevel: '',
    status: 'standard',
    telegram: '',
    user_text: ''
  });

  useEffect(() => {
    if (!user) return;

    setProfileData({
      region: user.region || '',
      businessSector: user.business_sector || '',
      transitionGoal: user.transition_goal || '',
      experienceLevel: user.experience_level || '',
      status: user.status || 'standard',
      telegram: (user as any).telegram || '',
      user_text: (user as any).user_text || ''
    });
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setLoadingText(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);

    const { data, error } = await supabase
      .from('users')
      .update({
        region: profileData.region,
        business_sector: profileData.businessSector,
        transition_goal: profileData.transitionGoal,
        experience_lvl: profileData.experienceLevel,
        status: profileData.status,
        telegram: profileData.telegram,
        user_text: profileData.user_text
      })
      .eq('email', user.email)
      .select()
      .single();

    if (error) {
      console.error('Ошибка обновления:', error.message);
      setIsSaving(false);
      return;
    }

    updateUser({
      user_id: data.user_id ?? data.id,
      email: data.email,
      region: data.region,
      business_sector: data.business_sector,
      transition_goal: data.transition_goal,
      experience_level: data.experience_lvl,
      status: data.status,
      telegram: data.telegram,
      user_text: data.user_text
    });

    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 5000 + Math.random() * 5000);
  };

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white flex justify-center items-center text-lg">Нет данных</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-zinc-900 shadow-xl rounded-xl p-8">
          <div className="flex items-center space-x-6 mb-8">
            <img src={generateAvatarUrl(user.user_id.toString())} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-indigo-600 shadow-md" />
            <div>
              <h2 className="text-3xl font-bold">{t('profileInfo') || 'Профиль'}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          {isSaving ? (
            <div className="text-center py-12 animate-pulse">
              <p className="text-xl">{loadingText}</p>
              <p className="text-sm text-gray-400 mt-2">Подождите, данные сохраняются...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { key: 'region', label: t('regionLabel'), options: REGIONS },
                { key: 'businessSector', label: t('businessSectorLabel'), options: BUSINESS_SECTORS },
                { key: 'transitionGoal', label: t('transitionGoalLabel'), options: TRANSITION_GOALS },
                { key: 'experienceLevel', label: t('experienceLevelLabel'), options: EXPERIENCE_LEVELS },
                { key: 'status', label: t('statusLabel'), options: ['standard', 'plus', 'admin'] }
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1">{label}</label>
                  {isEditing ? (
                    <select
                      value={(profileData as any)[key]}
                      onChange={(e) => setProfileData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 text-white"
                    >
                      <option value="">Выбрать...</option>
                      {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg text-zinc-300">{(profileData as any)[key] || '—'}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold mb-1">Telegram</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="@example"
                    value={profileData.telegram}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telegram: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white"
                  />
                ) : (
                  <p className="text-lg text-zinc-300">{profileData.telegram || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">О себе / о бизнесе</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    placeholder="Расскажи о себе или бизнесе..."
                    value={profileData.user_text}
                    onChange={(e) => setProfileData(prev => ({ ...prev, user_text: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white"
                  />
                ) : (
                  <p className="text-lg text-zinc-300 whitespace-pre-line">{profileData.user_text || '—'}</p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 border border-zinc-600 rounded hover:bg-zinc-800 transition"
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition"
                  >
                    Редактировать
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
