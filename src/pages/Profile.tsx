// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Briefcase,
  Target,
  Compass,
  SendHorizonal,
  Loader2,
  User2,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { useAuth }      from '../contexts/AuthContext';
import { useLanguage }  from '../contexts/LanguageContext';
import { supabase }     from '../lib/supabase';
import {
  REGIONS,
  BUSINESS_SECTORS,
  TRANSITION_GOALS,
  EXPERIENCE_LEVELS,
} from '../contexts/constants.ts';

/* robo-avatar */
const avatar = (id: string) =>
  `https://robohash.org/${encodeURIComponent(id)}?set=set1&size=150x150`;

/* шуточные «загрузочные» реплики */
const phrases = [
  'Считаем котов…',
  'Взламываем Пентагон…',
  'Собираем нейросеть…',
  'Оптимизируем бизнес…',
  'Генерируем идеи…',
  'Синхронизируем Бали с космосом…',
  'Проводим ретрит в фоне…',
];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  /* ui-state */
  const [edit,    setEdit]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [loadTxt, setLoadTxt] = useState('');
  const [data, setData] = useState({
    region: '',
    businessSector: '',
    transitionGoal: '',
    experienceLevel: '',
    telegram: '',
    user_text: '',
  });

  /* прогресс заполнения профиля */
  const total      = 6;
  const filled     = () =>
    [data.region, data.businessSector, data.transitionGoal, data.experienceLevel, data.telegram, data.user_text].filter(Boolean).length;
  const progress   = Math.round((filled() / total) * 100);

  /* подтягиваем данные из supabase-пользователя */
  useEffect(() => {
    if (!user) return;
    setData({
      region:          user.region           || '',
      businessSector:  user.business_sector  || '',
      transitionGoal:  user.transition_goal  || '',
      experienceLevel: user.experience_level || '',
      telegram:        (user as any).telegram    || '',
      user_text:       (user as any).user_text   || '',
    });
  }, [user]);

  /* сохранить */
  const handleSave = async () => {
    setSaving(true);
    setLoadTxt(phrases[Math.floor(Math.random() * phrases.length)]);

    const { data: upd, error } = await supabase
      .from('users')
      .update({
        region:          data.region,
        business_sector: data.businessSector,
        transition_goal: data.transitionGoal,
        experience_lvl:  data.experienceLevel,
        telegram:        data.telegram,
        user_text:       data.user_text,
      })
      .eq('email', user.email)
      .select()
      .single();

    setSaving(false);
    if (error) return console.error(error.message);

    updateUser({
      ...user,
      region:          upd.region,
      business_sector: upd.business_sector,
      transition_goal: upd.transition_goal,
      experience_level:upd.experience_lvl,
      telegram:        upd.telegram,
      user_text:       upd.user_text,
    });
    setEdit(false);
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Нет данных
      </div>
    );

  /* поля-селекты */
  const fields = [
    { key: 'region',          label: t('regionLabel') || 'Регион',           icon: <MapPin   className="w-4 h-4" />, options: REGIONS },
    { key: 'businessSector',  label: t('businessSectorLabel') || 'Сфера',    icon: <Briefcase className="w-4 h-4" />, options: BUSINESS_SECTORS },
    { key: 'transitionGoal',  label: t('transitionGoalLabel') || 'Цель',     icon: <Target    className="w-4 h-4" />, options: TRANSITION_GOALS },
    { key: 'experienceLevel', label: t('experienceLevelLabel') || 'Опыт',    icon: <Compass   className="w-4 h-4" />, options: EXPERIENCE_LEVELS },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white
                    pt-24 md:pt-28 pb-12 px-4">
      {/* ↑ pt-24 / pt-28  → красивый отступ под фикс-navbar */}

      <div className="max-w-3xl mx-auto bg-zinc-900/80 backdrop-blur rounded-3xl shadow-lg shadow-black/40 overflow-hidden">

        {/* header-блок */}
        <div className="flex flex-col md:flex-row gap-6 p-8 border-b border-white/10">
          <img
            src={avatar(user.user_id)}
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md"
          />

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
              <User2 className="w-6 h-6 text-indigo-400" />
              {t('profileInfo') || 'Профиль'}
            </h1>
            <p className="text-gray-400 break-all">{user.email}</p>

            {/* progress bar */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">
                Заполнено&nbsp;{progress}%
              </p>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 transition-all"
                />
              </div>
            </div>
          </div>

          {!saving && (
            <button
              onClick={() => setEdit(e => !e)}
              className="self-start md:self-center px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-2"
            >
              {edit ? <><X className="w-4 h-4" /> Отмена</> : <><Edit3 className="w-4 h-4" /> Редактировать</>}
            </button>
          )}
        </div>

        {/* спиннер сохранения */}
        {saving && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-lg">{loadTxt}</p>
          </div>
        )}

        {/* основная форма */}
        {!saving && (
          <div className="grid md:grid-cols-2 gap-6 p-8">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  {f.icon}
                  {f.label}
                </label>

                {edit ? (
                  <select
                    value={(data as any)[f.key]}
                    onChange={e => setData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2"
                  >
                    <option value="">—</option>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <p className="text-gray-300">{(data as any)[f.key] || '—'}</p>
                )}
              </div>
            ))}

            {/* Telegram */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold">Telegram</label>
              {edit ? (
                <input
                  value={data.telegram}
                  onChange={e => setData(prev => ({ ...prev, telegram: e.target.value }))}
                  className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2"
                  placeholder="@example"
                />
              ) : (
                <p className="text-gray-300">{data.telegram || '—'}</p>
              )}
            </div>

            {/* About */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold">О себе / о бизнесе</label>
              {edit ? (
                <textarea
                  rows={4}
                  value={data.user_text}
                  onChange={e => setData(prev => ({ ...prev, user_text: e.target.value }))}
                  className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2 resize-none"
                />
              ) : (
                <p className="text-gray-300 whitespace-pre-line">
                  {data.user_text || '—'}
                </p>
              )}
            </div>

            {/* Save btn */}
            {edit && (
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  <Check className="w-4 h-4" />
                  Сохранить
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
