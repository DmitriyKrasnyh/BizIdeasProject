/* ────────────────────────────────────────────────────────────────
   src/pages/IdeasSubmissionAndModeration.tsx
   1️⃣ SuggestIdea       — пользователь отправляет идею (status='pending')
   2️⃣ ModerateIdeas    — админ-панель подтверждения / отклонения
────────────────────────────────────────────────────────────────── */
import React, { useEffect, useState }   from 'react';
import { useNavigate }                  from 'react-router-dom';
import { motion, AnimatePresence }      from 'framer-motion';
import toast                            from 'react-hot-toast';

import { supabase }  from '../lib/supabase';
import { useAuth }   from '../contexts/AuthContext';
import { BUSINESS_SECTORS } from '../contexts/constants';

import {
  Tag, Send, Loader2, CheckCircle2, XCircle,
  Filter, Search,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────────
   1. SUGGEST IDEA
────────────────────────────────────────────────────────────────── */
export const SuggestIdea: React.FC = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  /* поля формы */
  const [userId,      setUserId]     = useState<number | null>(null);
  const [title,       setTitle]      = useState('');
  const [description, setDescription]= useState('');
  const [tags,        setTags]       = useState<string[]>([]);
  const [customTag,   setCustomTag]  = useState('');

  /* ui-state */
  const [step,        setStep]       = useState<'form'|'preview'|'done'>('form');
  const [loading,     setLoading]    = useState(false);

  /* numeric user_id (int) */
  useEffect(() => {
    document.title = 'Предложить идею | BizIdeas';

    if (!user?.email) return;
    supabase
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setUserId(data?.user_id ?? null);
      });
  }, [user]);

  /* helpers */
  const toggleTag = (t: string) =>
    setTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setCustomTag('');
  };

  /* submit */
  const handleSubmit = async () => {
    if (!userId)                    return toast.error('Сначала войдите в аккаунт');
    if (title.trim().length < 4)    return toast.error('Название слишком короткое');
    if (description.trim().length < 20)
       return toast.error('Опиши идею подробнее');

    setLoading(true);
    const { error } = await supabase
      .from('user_ideas_submissions')
      .insert({
        user_id:    userId,
        title,
        description,
        tags,                         // text[]
        status:     'pending',        // ← будет фильтром для админа
      });
    setLoading(false);

    if (error) toast.error(error.message);
    else       setStep('done');
  };

  /* UI */
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-20 px-4
                    bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">
      <div className="max-w-3xl mx-auto">
        {/* stepper */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['Форма','Превью','Отправлено'].map((l,i)=>(
            <React.Fragment key={l}>
              <div className={`w-8 h-8 rounded-full grid place-content-center
                               ${(step==='form'&&i===0)||(step==='preview'&&i===1)||(step==='done'&&i===2)
                                 ?'bg-indigo-600':'bg-zinc-700'}`}>{i+1}</div>
              {i!==2 && <div className="w-8 h-1 bg-zinc-600"/>}
            </React.Fragment>
          ))}
        </div>

        {/* FORM / PREVIEW / DONE */}
        <AnimatePresence mode="wait">
          {step==='form' && (
            <motion.form
              key="form"
              initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}}
              transition={{duration:0.25}}
              onSubmit={e=>{e.preventDefault(); setStep('preview');}}
              className="space-y-6 bg-zinc-900/70 p-8 rounded-2xl shadow-xl border border-zinc-800">

              <h1 className="text-3xl font-bold text-center mb-6">Предложить новую идею</h1>

              <label className="block">
                <span className="text-sm font-medium">Название</span>
                <input
                  value={title} onChange={e=>setTitle(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
                  placeholder="Кафе без сахара" required/>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Описание</span>
                <textarea
                  value={description} onChange={e=>setDescription(e.target.value)}
                  rows={6} required
                  placeholder="Кратко расскажи, в чём суть, для кого и как зарабатываешь…"
                  className="mt-1 w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"/>
              </label>

              <div>
                <p className="text-sm font-medium mb-2">Теги / сферы</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {BUSINESS_SECTORS.map(t=>(
                    <button key={t} type="button" onClick={()=>toggleTag(t)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center transition
                                  ${tags.includes(t)?'bg-blue-600':'bg-zinc-700 hover:bg-zinc-600'}`}>
                      <Tag className="w-4 h-4 mr-1"/>{t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={customTag} onChange={e=>setCustomTag(e.target.value)}
                    placeholder="Свой тег…"
                    className="flex-1 px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700"/>
                  <button type="button" onClick={addCustomTag}
                          className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500">
                    Добавить
                  </button>
                </div>
                {!!tags.length && (
                  <p className="mt-3 text-sm text-zinc-400">Выбрано: {tags.join(', ')}</p>
                )}
              </div>

              <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold">
                Далее
              </button>
            </motion.form>
          )}

          {step==='preview' && (
            <motion.div key="preview"
              initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}}
              transition={{duration:0.25}}
              className="bg-zinc-900/70 p-8 rounded-2xl shadow-xl border border-zinc-800">
              <h2 className="text-2xl font-bold mb-4">Превью</h2>

              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-zinc-300 whitespace-pre-wrap mb-4">{description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(t=>(
                  <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-800">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={()=>setStep('form')}
                        className="flex-1 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600">
                  Назад
                </button>
                <button
                  onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                             flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin"/>
                    : <Send className="w-4 h-4"/>}
                  Отправить
                </button>
              </div>
            </motion.div>
          )}

          {step==='done' && (
            <motion.div key="done"
              initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              className="text-center bg-zinc-900/70 p-10 rounded-2xl shadow-xl border border-zinc-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4"/>
              <h2 className="text-2xl font-bold mb-2">Спасибо!</h2>
              <p className="text-zinc-300 mb-6">
                Идея отправлена на модерацию. Мы сообщим, когда она пройдёт проверку.
              </p>
              <button onClick={()=>navigate('/ideas')}
                      className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">
                Вернуться к идеям
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   2. MODERATE IDEAS  — админ-панель
   ▸ admin определяется по users.status === 'admin'
   ▸ тащит ВСЁ, где status = 'pending'  ИЛИ  status IS NULL
--------------------------------------------------------------------------- */
interface Submission {
  submission_id: string;
  title:         string;
  description:   string;
  tags:          string[] | string;   // text[] приходит массивом, но бывает csv
  created_at:    string;
  user_email:    string | null;
}

export const ModerateIdeas: React.FC = () => {
  const { user }   = useAuth();
  const isAdmin    = user?.status === 'admin';

  const [subs,    setSubs]    = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search,  setSearch]  = React.useState('');

  /* ───────── загрузка only for admins ───────── */
  React.useEffect(() => {
    document.title = 'Модерация идей | BizIdeas';
    if (!isAdmin) return;

    const load = async () => {
      /* берём всё, где status = pending ИЛИ status IS NULL  */
      const { data, error } = await supabase
        .from('user_ideas_submissions')
        .select(`
          submission_id, title, description, tags, created_at, status,
          users:user_id ( email )
        `)
        .or('status.eq.pending,status.is.null')        // ← ключевая строка
        .order('created_at');

      if (error) toast.error(error.message);
      else {
        const list = (data ?? []).map((r: any) => ({
          submission_id : r.submission_id,
          title         : r.title,
          description   : r.description,
          tags          : Array.isArray(r.tags) ? r.tags : String(r.tags).split(','),
          created_at    : r.created_at,
          user_email    : r.users?.email ?? null,
        }));
        setSubs(list);
      }
      setLoading(false);
    };

    load();
  }, [isAdmin]);

  /* нет прав → быстрый выход */
  if (!isAdmin)
    return <p className="text-center mt-40 text-zinc-400">Нет доступа</p>;

  /* helper: approve / reject */
  const decide = async(id: string, approve: boolean) => {
    const reason = approve ? null :
      (prompt('Почему отклоняем? (опционально)') ?? null);

    const { error } = await supabase
      .from('user_ideas_submissions')
      .update({
        status      : approve ? 'approved' : 'rejected',
        reviewed_by : user!.user_id,
        reviewed_at : new Date().toISOString(),
        reason,
      })
      .eq('submission_id', id);

    if (error) return toast.error(error.message);

    if (approve) {
      const rec = subs.find(s => s.submission_id === id)!;
      await supabase.from('trendingideas').insert({
        title           : rec.title,
        description     : rec.description,
        tags            : rec.tags,
        source_parse_id : 'user',
        popularity_score: 0,
      });
    }

    toast.success(approve ? 'Опубликовано' : 'Отклонено');
    setSubs(p => p.filter(s => s.submission_id !== id));
  };

  const shown = subs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  );

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-20 px-4
                    bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-bold mb-8">
          <Filter className="w-6 h-6"/> Модерация идей
        </h1>

        {/* поиск */}
        <div className="max-w-md mx-auto relative mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700"/>
        </div>

        {/* список */}
        {loading ? (
          <p className="text-center text-zinc-400">Загрузка…</p>
        ) : shown.length === 0 ? (
          <p className="text-center text-zinc-400">Новых предложений нет</p>
        ) : (
          <motion.div layout className="space-y-6">
            {shown.map(s => (
              <motion.div key={s.submission_id} layout
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-2">{s.title}</h2>

                <p className="text-sm text-zinc-300 whitespace-pre-wrap mb-4
                              max-h-[160px] overflow-y-auto scrollbar-thin
                              scrollbar-thumb-zinc-700">
                  {s.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {s.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-800">
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-zinc-500 mb-4">
                  Автор: {s.user_email ?? '—'} · {new Date(s.created_at).toLocaleString()}
                </p>

                <div className="flex gap-3">
                  <button onClick={()=>decide(s.submission_id,true)}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                                     flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4"/> Опубликовать
                  </button>
                  <button onClick={()=>decide(s.submission_id,false)}
                          className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500
                                     flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4"/> Отклонить
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};