/* ────────────────────────────────────────────────────────────────
   src/pages/Profile.tsx
   + вывод «Выбранной идеи» пользователя
────────────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react';
import {
  MapPin, Briefcase, Target, Compass,
  Edit3, X, Check, Loader2, User2, Tag,
} from 'lucide-react';

import { supabase }     from '../lib/supabase';
import { useAuth }      from '../contexts/AuthContext';
import { useLanguage }  from '../contexts/LanguageContext';
import {
  REGIONS, BUSINESS_SECTORS, TRANSITION_GOALS, EXPERIENCE_LEVELS,
} from '../contexts/constants';

/* helpers */
const robo = (id: string) =>
  `https://robohash.org/${encodeURIComponent(id)}?set=set1&size=150x150`;

const jokes = [
  'Считаем котов…',         'Взламываем Пентагон…',
  'Собираем нейросеть…',    'Оптимизируем бизнес…',
  'Генерируем идеи…',       'Синхронизируем Бали с космосом…',
  'Проводим ретрит в фоне…',
];

interface Idea {
  idea_id: number;
  title: string;
  description: string;
  tags: string[];
  popularity_score: number | null;
}

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  /* ui-state */
  const [edit, setEdit]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [hint, setHint]         = useState('');

  const [form, setForm] = useState({
    region:'', businessSector:'', transitionGoal:'',
    experienceLevel:'', telegram:'', user_text:'',
  });

  const [idea, setIdea] = useState<Idea | null>(null);

  /* ─── fetch profile/idea once ─── */
  useEffect(() => {
    document.title = 'BizIdeas | Профиль';
    if (!user) return;

    setForm({
      region:           user.region           ?? '',
      businessSector:   user.business_sector  ?? '',
      transitionGoal:   user.transition_goal  ?? '',
      experienceLevel:  user.experience_level ?? '',
      telegram:        (user as any).telegram    ?? '',
      user_text:       (user as any).user_text   ?? '',
    });

    (async () => {
      const { data } = await supabase
        .from('userideas')
        .select(`idea_id, idea:idea_id ( title, description, tags, popularity_score )`)
        .eq('user_id', user.user_id).single();

      if (data?.idea) setIdea(data.idea as Idea);
      else setIdea(null);
    })();
  }, [user]);

  /* заполненность профиля */
  const progress = Math.round(
    Object.values(form).filter(Boolean).length / 6 * 100
  );

  /* ─── save ─── */
  const save = async () => {
    setSaving(true);
    setHint(jokes[Math.floor(Math.random() * jokes.length)]);

    const { data: upd, error } = await supabase
      .from('users').update({
        region:          form.region,
        business_sector: form.businessSector,
        transition_goal: form.transitionGoal,
        experience_lvl:  form.experienceLevel,
        telegram:        form.telegram,
        user_text:       form.user_text,
      })
      .eq('email', user.email).select().single();

    setSaving(false);
    if (error) return console.error(error.message);

    updateUser({
      ...user,
      region: upd.region, business_sector: upd.business_sector,
      transition_goal: upd.transition_goal, experience_level: upd.experience_lvl,
      telegram: upd.telegram, user_text: upd.user_text,
    });
    setEdit(false);
  };

  if (!user)
    return <div className="min-h-screen grid place-items-center text-white">Нет данных</div>;

  /* поля-селекты */
  const fields = [
    { k:'region',          l:t('regionLabel')||'Регион',        icon:<MapPin className="w-4 h-4"/>,  opt:REGIONS },
    { k:'businessSector',  l:t('businessSectorLabel')||'Сфера', icon:<Briefcase className="w-4 h-4"/>,opt:BUSINESS_SECTORS },
    { k:'transitionGoal',  l:t('transitionGoalLabel')||'Цель',  icon:<Target className="w-4 h-4"/>,  opt:TRANSITION_GOALS },
    { k:'experienceLevel', l:t('experienceLevelLabel')||'Опыт', icon:<Compass className="w-4 h-4"/>, opt:EXPERIENCE_LEVELS },
  ] as const;

  /* ─── UI ─── */
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4
                    bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">

      <div className="max-w-3xl mx-auto bg-zinc-900/80 backdrop-blur
                      rounded-3xl shadow-lg shadow-black/40 overflow-hidden">

        {/* header */}
        <div className="flex flex-col md:flex-row gap-6 p-8 border-b border-white/10">
          <img src={robo(user.user_id)}
               className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md" />

          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-3xl font-bold mb-1">
              <User2 className="w-6 h-6 text-indigo-400"/> Профиль
            </h1>
            <p className="text-gray-400 break-all">{user.email}</p>

            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">
                Заполнено&nbsp;{progress}%
              </p>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div style={{width:`${progress}%`}}
                     className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600"/>
              </div>
            </div>
          </div>

          {!saving && (
            <button onClick={()=>setEdit(e=>!e)}
              className="self-start md:self-center flex items-center gap-2
                         px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">
              {edit ? <><X className="w-4 h-4"/> Отмена</>
                    : <><Edit3 className="w-4 h-4"/> Редактировать</>}
            </button>
          )}
        </div>

        {/* spinner */}
        {saving && (
          <div className="grid place-items-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500"/>
            <p className="text-lg">{hint}</p>
          </div>
        )}

        {/* MAIN */}
        {!saving && (
          <div className="p-8 space-y-10">

            {/* блок выбранной идеи */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400"/> Выбранная идея
              </h2>

              {idea ? (
                <article className="bg-zinc-800/70 backdrop-blur rounded-2xl p-5 shadow flex flex-col gap-3">
                  <h3 className="text-indigo-300 font-semibold">{idea.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-4">{idea.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map(t=>(
                      <span key={t}
                        className="px-2 py-0.5 text-xs rounded-full
                                   bg-indigo-700 text-white flex items-center gap-1">
                        <Tag className="w-3 h-3"/>{t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    📈 popularity: {idea.popularity_score?.toFixed(1) ?? '—'}
                  </p>
                </article>
              ) : (
                <p className="text-sm text-gray-400">
                  Идея не выбрана. Перейдите во вкладку&nbsp;
                  <span className="underline cursor-pointer"
                        onClick={()=>location.assign('/ideas')}>«Идеи»</span>
                  &nbsp;и сохраните понравившийся вариант.
                </p>
              )}
            </section>

            {/* форма / просмотр */}
            <div className="grid md:grid-cols-2 gap-6">
              {fields.map(f=>(
                <div key={f.k} className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    {f.icon} {f.l}
                  </label>
                  {edit ? (
                    <select value={(form as any)[f.k]}
                            onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                            className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2">
                      <option value="">—</option>
                      {f.opt.map(o=><option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <p className="text-gray-300">{(form as any)[f.k]||'—'}</p>
                  )}
                </div>
              ))}

              {/* Telegram */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold">Telegram</label>
                {edit ? (
                  <input value={form.telegram}
                         onChange={e=>setForm(p=>({...p,telegram:e.target.value}))}
                         className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2"
                         placeholder="@example"/>
                ) : (
                  <p className="text-gray-300">{form.telegram || '—'}</p>
                )}
              </div>

              {/* about */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-semibold">О себе / о бизнесе</label>
                {edit ? (
                  <textarea rows={4} value={form.user_text}
                    onChange={e=>setForm(p=>({...p,user_text:e.target.value}))}
                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2 resize-none"/>
                ) : (
                  <p className="text-gray-300 whitespace-pre-line">{form.user_text || '—'}</p>
                )}
              </div>

              {edit && (
                <div className="md:col-span-2 flex justify-end">
                  <button onClick={save}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg
                               bg-indigo-600 hover:bg-indigo-700 transition">
                    <Check className="w-4 h-4"/> Сохранить
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* маленькая лампочка для h2 */
function Lightbulb(props:any){return <svg viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  {...props}><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12v3h8v-3A7 7 0 0 0 12 2z"/>
</svg>} 
