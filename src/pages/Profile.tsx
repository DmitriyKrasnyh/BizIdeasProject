/* ────────────────────────────────────────────────────────────────
   src/pages/Profile.tsx
   ▸ Joyride-онбординг (с кастомным FancyTooltip)
   ▸ Подсказка про Telegram — нужен для AI-бота @BizIdeasTrendsBot
────────────────────────────────────────────────────────────────── */
import React, { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import {
  MapPin, Briefcase, Target, Compass,
  Edit3, X, Check, Loader2,
  User2, Tag, Lightbulb, HelpCircle,
} from 'lucide-react';

import FancyTooltip                                                       from '../components/FancyTooltip';
import { supabase }                                                       from '../lib/supabase';
import { useAuth }                                                        from '../contexts/AuthContext';
import { useLanguage }                                                    from '../contexts/LanguageContext';
import {
  REGIONS, BUSINESS_SECTORS, TRANSITION_GOALS, EXPERIENCE_LEVELS,
}                                                                         from '../contexts/constants';

/* ───────── helpers ───────── */
const robo = (id: string) =>
  `https://robohash.org/${encodeURIComponent(id)}?set=set1&size=150x150`;

const jokes = [
  'Считаем котов…', 'Синхронизируем космос…',
  'Оптимизируем бизнес…', 'Генерируем идеи…',
];

interface Idea{
  idea_id:number;title:string;description:string;tags:string[];
  popularity_score:number|null;
}

/* ───────── Joyride steps ───────── */
const steps: Step[] = [
  { target:'#avatar-block',        content:'Ваш аватар — меняйте, когда захотите.' },
  { target:'#region-block',        content:'Регион нужен для локальных рекомендаций.' },
  { target:'#sector-block',        content:'Укажите отрасль вашего бизнеса.' },
  { target:'#experience-block',    content:'Опыт влияет на детализацию советов.' },
  { target:'#telegram-block',      content:'Добавьте @username, чтобы связать AI-бота в Telegram.' },
  { target:'#save-block',          content:'Не забудьте сохранить изменения.' },
];

/* ═════════════════════════ component ═════════════════════════ */
export const Profile:React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t }                = useLanguage();

  const [edit, setEdit]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [hint, setHint]         = useState('');
  const [runGuide, setRunGuide] = useState(!localStorage.getItem('guide_profile_seen'));

  const [form, setForm]=useState({
    region:'', businessSector:'', transitionGoal:'',
    experienceLevel:'', telegram:'', user_text:'',
  });
  const [idea,setIdea]=useState<Idea|null>(null);

  /* ───── загрузка профиля ───── */
  useEffect(()=>{
    document.title='BizIdeas | Профиль';
    if(!user) return;

    setForm({
      region:          user.region           ?? '',
      businessSector:  user.business_sector  ?? '',
      transitionGoal:  user.transition_goal  ?? '',
      experienceLevel: user.experience_lvl   ?? '',
      telegram:       (user as any).telegram ?? '',
      user_text:      (user as any).user_text?? '',
    });

    (async()=>{
      const { data } = await supabase
        .from('userideas')
        .select(`idea:idea_id ( idea_id,title,description,tags,popularity_score )`)
        .eq('user_id', user.user_id)
        .maybeSingle();
      setIdea(data?.idea ?? null);
    })();
  },[user]);

  const progress=Math.round(
    Object.values(form).filter(Boolean).length/6*100,
  );

  /* save */
  const save=async()=>{
    setSaving(true);
    setHint(jokes[Math.floor(Math.random()*jokes.length)]);

    const { data, error } = await supabase
      .from('users')
      .update({
        region:          form.region,
        business_sector: form.businessSector,
        transition_goal: form.transitionGoal,
        experience_lvl:  form.experienceLevel,
        telegram:        form.telegram,
        user_text:       form.user_text,
      })
      .eq('email', user!.email)
      .select()
      .single();

    setSaving(false);
    if(error) return alert(error.message);

    updateUser({ ...user!, ...data });
    setEdit(false);
  };

  if(!user)
    return <div className="min-h-screen grid place-items-center text-white">Нет данных</div>;

  /* ► генерируем input / view блоки */
  const makeBlock=(id:string,label:string,Icon:React.FC<any>,
                   key:keyof typeof form,opts?:string[])=>(
    <div id={id} className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="w-4 h-4"/>{label}
      </label>
      {edit?(
        <select value={form[key]}
                onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2">
          <option value="">—</option>
          {opts!.map(o=><option key={o}>{o}</option>)}
        </select>
      ):(
        <p className="text-gray-300">{form[key]||'—'}</p>
      )}
    </div>
  );

  /* Joyride cb */
  const onJoy=(d:CallBackProps)=>{
    if([STATUS.FINISHED,STATUS.SKIPPED].includes(d.status as STATUS)){
      localStorage.setItem('guide_profile_seen','yes');
      setRunGuide(false);
    }
  };

  /* ───────────────────────── UI ───────────────────────── */
  return(
  <div className="min-h-screen pt-24 md:pt-28 pb-12 px-4
                  bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">

    {/* Joyride */}
    <Joyride
      steps={steps}
      run={runGuide}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      spotlightClicks
      disableScrolling={false}
      tooltipComponent={FancyTooltip}
      styles={{ options:{ zIndex:9999, primaryColor:'#6366f1' } }}
      callback={onJoy}
    />

    {/* card */}
    <div className="max-w-3xl mx-auto bg-zinc-900/80 backdrop-blur
                    rounded-3xl shadow-lg shadow-black/40 overflow-hidden">

      {/* header */}
      <div className="flex flex-col md:flex-row gap-6 p-8 border-b border-white/10">

        <img id="avatar-block"
             src={robo(user.user_id)}
             alt="avatar"
             className="w-24 h-24 rounded-full border-4 border-indigo-500 shadow-md"/>

        {/* middle section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <User2 className="w-6 h-6 text-indigo-400"/> Профиль
            </h1>

            {/* ? icon – рестарт обучения */}
            <button
              onClick={()=>{localStorage.removeItem('guide_profile_seen');setRunGuide(true);}}
              className="p-1.5 hover:bg-white/10 rounded-md"
              aria-label="Обучение"
            >
              <HelpCircle className="w-5 h-5 text-gray-400"/>
            </button>
          </div>

          <p className="text-gray-400 break-all">{user.email}</p>

          {/* progress bar */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-1">Заполнено {progress}%</p>
            <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div style={{width:`${progress}%`}}
                   className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600"/>
            </div>
          </div>
        </div>

        {/* edit / cancel */}
        {!saving&&(
          <button
            onClick={()=>setEdit(!edit)}
            className="self-start md:self-center flex items-center gap-2
                       px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
          >
            {edit? <><X className="w-4 h-4"/> Отмена</>
                 : <><Edit3 className="w-4 h-4"/> Редактировать</>}
          </button>
        )}
      </div>

      {/* loader */}
      {saving?(
        <div className="grid place-items-center py-16 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500"/>
          <p className="text-lg">{hint}</p>
        </div>
      ):(
        <div className="p-8 space-y-10">

          {/* выбранная идея */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400"/> Выбранная идея
            </h2>

            {idea?(
              <article className="bg-zinc-800/70 backdrop-blur rounded-2xl p-5 shadow flex flex-col gap-3">
                <h3 className="text-indigo-300 font-semibold">{idea.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-4">{idea.description}</p>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map(t=>(
                    <span key={t}
                          className="px-2 py-0.5 text-xs rounded-full bg-indigo-700 text-white flex items-center gap-1">
                      <Tag className="w-3 h-3"/>{t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  📈 popularity: {idea.popularity_score?.toFixed(1) ?? '—'}
                </p>
              </article>
            ):(
              <p className="text-sm text-gray-400">
                Идея не выбрана. Перейдите во вкладку&nbsp;
                <span className="underline cursor-pointer"
                      onClick={()=>location.assign('/ideas')}>«Идеи»</span>.
              </p>
            )}
          </section>

          {/* форма / просмотр */}
          <div className="grid md:grid-cols-2 gap-6">
            {makeBlock('region-block',     'Регион',    MapPin,    'region',          REGIONS)}
            {makeBlock('sector-block',     'Сфера',     Briefcase, 'businessSector',  BUSINESS_SECTORS)}
            {makeBlock('transition-block', 'Цель',      Target,    'transitionGoal',  TRANSITION_GOALS)}
            {makeBlock('experience-block', 'Опыт',      Compass,   'experienceLevel', EXPERIENCE_LEVELS)}

            {/* Telegram */}
            <div id="telegram-block" className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold">Telegram (для AI-бота)</label>
              {edit?(
                <input value={form.telegram}
                       onChange={e=>setForm(p=>({...p,telegram:e.target.value}))}
                       placeholder="@username"
                       className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2"/>
              ):(
                <p className="text-gray-300">{form.telegram||'—'}</p>
              )}
            </div>

            {/* about */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold">О себе / о бизнесе</label>
              {edit?(
                <textarea rows={4}
                          value={form.user_text}
                          onChange={e=>setForm(p=>({...p,user_text:e.target.value}))}
                          className="w-full rounded-md bg-zinc-800 border border-zinc-700 p-2 resize-none"/>
              ):(
                <p className="text-gray-300 whitespace-pre-line">
                  {form.user_text||'—'}
                </p>
              )}
            </div>

            {/* save btn */}
            {edit&&(
              <div id="save-block" className="md:col-span-2 flex justify-end">
                <button
                  onClick={save}
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
  </div>);
};
