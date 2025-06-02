/* ────────────────────────────────────────────────────────────────
   src/pages/IdeasSubmissionAndModeration.tsx
   ▸ 1) SuggestIdea  — отправка идеи c авто-сохранением черновика
   ▸ 2) ModerateIdeas— админ-модерация
   Адаптировано под мобильные, navbar фикс-спейсер, кнопка «Предложить»
   закреплена в футере.                                                  */
   import React, { useEffect, useState } from 'react';
   import { useNavigate }                from 'react-router-dom';
   import { motion, AnimatePresence }    from 'framer-motion';
   import toast                          from 'react-hot-toast';
   import {
     Tag, Send, Loader2, CheckCircle2, XCircle,
     Filter, Search, Plus,
   } from 'lucide-react';
   
   import { supabase }           from '../lib/supabase';
   import { useAuth }            from '../contexts/AuthContext';
   import { BUSINESS_SECTORS }   from '../contexts/constants';
   
   /* ════════════════════════════════════════════════════════════════
      1. SUGGEST IDEA
   ═════════════════════════════════════════════════════════════════ */
   export const SuggestIdea: React.FC = () => {
     const { user }  = useAuth();
     const nav       = useNavigate();
   
     /* ---------- черновик из localStorage ---------- */
     const draft = JSON.parse(localStorage.getItem('idea_draft') || '{}');
   
     /* form fields */
     const [userId, setUserId]       = useState<number | null>(null);
     const [title, setTitle]         = useState(draft.title || '');
     const [description, setDesc]    = useState(draft.description || '');
     const [tags, setTags]           = useState<string[]>(draft.tags || []);
     const [customTag, setCustom]    = useState('');
   
     /* ui */
     const [step, setStep]           = useState<'form'|'preview'|'done'>('form');
     const [loading, setLoading]     = useState(false);
   
     /* fetch numeric user_id */
     useEffect(() => {
       document.title = 'BizIdeas | Предложить идею ';
   
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
   
     /* -------- черновик: save / restore ---------- */
     useEffect(() => {
       if (step !== 'form') return;
       localStorage.setItem(
         'idea_draft',
         JSON.stringify({ title, description, tags }),
       );
     }, [title, description, tags, step]);
   
     useEffect(() => {
       if (draft.title || draft.description || (draft.tags ?? []).length) {
         toast('Черновик восстановлен', { icon: '📝', id: 'draft' });
       }
     }, []); // run once
   
     const clearDraft = () => localStorage.removeItem('idea_draft');
   
     /* helpers */
     const toggleTag = (t:string) =>
       setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
   
     const addCustom = () => {
       const t = customTag.trim();
       if (t && !tags.includes(t)) setTags([...tags, t]);
       setCustom('');
     };
   
     /* submit */
     const handleSubmit = async () => {
       if (!userId)                 return toast.error('Сначала войдите в аккаунт');
       if (title.trim().length < 4) return toast.error('Название слишком короткое');
       if (description.trim().length < 20)
         return toast.error('Опиши идею подробнее');
   
       setLoading(true);
       const { error } = await supabase.from('user_ideas_submissions').insert({
         user_id: userId,
         title,
         description,
         tags,
         status: 'pending',
       });
       setLoading(false);
   
       if (error) toast.error(error.message);
       else {
         clearDraft();
         setStep('done');
       }
     };
   
     /* ---------- UI ---------- */
     return (
       <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">
   
         {/* spacer под фиксированный navbar */}
         <div className="h-16 sm:h-20 shrink-0" />
   
         <main className="flex-1 flex flex-col items-center px-4 pb-24">
   
           {/* stepper */}
           <div className="flex justify-center gap-4 mb-8 sm:mb-10 select-none">
             {['Форма', 'Превью', 'Отправлено'].map((l, i) => {
               const active =
                 (step === 'form' && i === 0) ||
                 (step === 'preview' && i === 1) ||
                 (step === 'done' && i === 2);
               return (
                 <React.Fragment key={l}>
                   <div
                     className={`w-8 h-8 rounded-full grid place-content-center
                                 ${active ? 'bg-indigo-500' : 'bg-zinc-600'}`}
                   >
                     {i + 1}
                   </div>
                   {i !== 2 && <div className="h-1 w-8 bg-zinc-700" />}
                 </React.Fragment>
               );
             })}
           </div>
   
           {/* FORM / PREVIEW / DONE */}
           <AnimatePresence mode="wait">
             {step === 'form' && (
               <motion.form
                 key="form"
                 initial={{ opacity: 0, x: 40 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -40 }}
                 transition={{ duration: 0.25 }}
                 onSubmit={e => {
                   e.preventDefault();
                   setStep('preview');
                 }}
                 className="w-full max-w-md sm:max-w-xl bg-zinc-900/70
                            p-5 sm:p-8 rounded-2xl shadow-xl border border-zinc-800 space-y-6"
               >
                 <h1 className="text-2xl sm:text-3xl font-bold text-center">
                   Предложить новую идею
                 </h1>
   
                 {/* название */}
                 <label className="block text-sm font-medium">
                   Название
                   <input
                     value={title}
                     onChange={e => setTitle(e.target.value)}
                     placeholder="Кафе без сахара"
                     className="mt-1 w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
                     required
                   />
                 </label>
   
                 {/* описание */}
                 <label className="block text-sm font-medium">
                   Описание
                   <textarea
                     value={description}
                     onChange={e => setDesc(e.target.value)}
                     rows={6}
                     placeholder="Кратко расскажи, в чём суть, кому полезно и как зарабатываешь…"
                     className="mt-1 w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
                     required
                   />
                 </label>
   
                 {/* теги */}
                 <div>
                   <p className="text-sm font-medium mb-2">Теги / сферы</p>
                   <div className="flex flex-wrap gap-2 mb-3">
                     {BUSINESS_SECTORS.map(t => (
                       <button
                         key={t}
                         type="button"
                         onClick={() => toggleTag(t)}
                         className={`px-3 py-1 rounded-full text-sm flex items-center transition
                                     ${
                                       tags.includes(t)
                                         ? 'bg-blue-600'
                                         : 'bg-zinc-700 hover:bg-zinc-600'
                                     }`}
                       >
                         <Tag className="w-4 h-4 mr-1" />
                         {t}
                       </button>
                     ))}
                   </div>
   
                   <div className="flex gap-2">
                     <input
                       value={customTag}
                       onChange={e => setCustom(e.target.value)}
                       placeholder="Свой тег…"
                       className="flex-1 px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700"
                     />
                     <button
                       type="button"
                       onClick={addCustom}
                       className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500"
                     >
                       Добавить
                     </button>
                   </div>
   
                   {!!tags.length && (
                     <p className="mt-3 text-sm text-zinc-400">
                       Выбрано: {tags.join(', ')}
                     </p>
                   )}
                 </div>
   
                 <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold">
                   Далее
                 </button>
               </motion.form>
             )}
   
             {step === 'preview' && (
               <motion.div
                 key="preview"
                 initial={{ opacity: 0, x: 40 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -40 }}
                 transition={{ duration: 0.25 }}
                 className="w-full max-w-md sm:max-w-xl bg-zinc-900/70
                            p-5 sm:p-8 rounded-2xl shadow-xl border border-zinc-800"
               >
                 <h2 className="text-2xl font-bold mb-4">Превью</h2>
   
                 <h3 className="text-xl font-semibold mb-2">{title}</h3>
                 <p className="text-zinc-300 whitespace-pre-wrap mb-4">
                   {description}
                 </p>
   
                 <div className="flex flex-wrap gap-2 mb-6">
                   {tags.map(t => (
                     <span
                       key={t}
                       className="px-2 py-0.5 text-xs rounded-full bg-blue-800"
                     >
                       {t}
                     </span>
                   ))}
                 </div>
   
                 <div className="flex gap-3">
                   <button
                     onClick={() => setStep('form')}
                     className="flex-1 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
                   >
                     Назад
                   </button>
                   <button
                     onClick={handleSubmit}
                     disabled={loading}
                     className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                                flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {loading ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <Send className="w-4 h-4" />
                     )}
                     Отправить
                   </button>
                 </div>
               </motion.div>
             )}
   
             {step === 'done' && (
               <motion.div
                 key="done"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full max-w-md sm:max-w-xl text-center bg-zinc-900/70
                            p-8 rounded-2xl shadow-xl border border-zinc-800"
               >
                 <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold mb-2">Спасибо!</h2>
                 <p className="text-zinc-300 mb-6">
                   Идея отправлена на модерацию. Мы сообщим, когда она пройдёт
                   проверку.
                 </p>
                 <button
                   onClick={() => nav('/ideas')}
                   className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
                 >
                   Вернуться к идеям
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
   
           {/* footer suggest btn */}
           <div id="footer-suggest" className="flex justify-center sm:justify-end w-full mt-12 sm:mt-16">
             <button
               onClick={() => nav('/suggest-idea')}
               className="flex items-center gap-2
                          bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500
                          px-6 py-3 rounded-full text-white font-semibold
                          shadow-xl shadow-teal-800/40 backdrop-blur-lg"
             >
               <Plus className="w-5 h-5" />
               Предложить идею
             </button>
           </div>
         </main>
       </div>
     );
   };
   
   /* ════════════════════════════════════════════════════════════════
      2. MODERATE IDEAS (без изменений, кроме мелкой адаптивности)
   ═════════════════════════════════════════════════════════════════ */
   interface Submission {
     submission_id: string;
     title: string;
     description: string;
     tags: string[] | string;
     created_at: string;
     user_email: string | null;
   }
   
   export const ModerateIdeas: React.FC = () => {
     const { user } = useAuth();
     const isAdmin  = user?.status === 'admin';
   
     const [subs, setSubs]       = useState<Submission[]>([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch]   = useState('');
   
     useEffect(() => {
       document.title = 'BizIdeas | Модерация идей ';
       if (!isAdmin) return;
   
       (async () => {
         const { data, error } = await supabase
           .from('user_ideas_submissions')
           .select(`
             submission_id, title, description, tags, created_at, status,
             users:user_id(email)
           `)
           .or('status.eq.pending,status.is.null')
           .order('created_at');
   
         if (error) toast.error(error.message);
         else {
           setSubs(
             (data ?? []).map((r: any) => ({
               submission_id: r.submission_id,
               title: r.title,
               description: r.description,
               tags: Array.isArray(r.tags) ? r.tags : String(r.tags).split(','),
               created_at: r.created_at,
               user_email: r.users?.email ?? null,
             })),
           );
         }
         setLoading(false);
       })();
     }, [isAdmin]);
   
     if (!isAdmin)
       return (
         <p className="min-h-screen flex items-center justify-center text-zinc-400">
           Нет доступа
         </p>
       );
   
     const decide = async (id: string, approve: boolean) => {
       const reason = approve ? null : prompt('Почему отклоняем? (опционально)') ?? null;
   
       const { error } = await supabase
         .from('user_ideas_submissions')
         .update({
           status: approve ? 'approved' : 'rejected',
           reviewed_by: user!.user_id,
           reviewed_at: new Date().toISOString(),
           reason,
         })
         .eq('submission_id', id);
   
       if (error) return toast.error(error.message);
   
       if (approve) {
         const rec = subs.find(s => s.submission_id === id)!;
         await supabase.from('trendingideas').insert({
           title: rec.title,
           description: rec.description,
           tags: rec.tags,
           source_parse_id: 'user',
           popularity_score: 0,
         });
       }
   
       toast.success(approve ? 'Опубликовано' : 'Отклонено');
       setSubs(p => p.filter(s => s.submission_id !== id));
     };
   
     const shown = subs.filter(s =>
       s.title.toLowerCase().includes(search.toLowerCase()),
     );
   
     return (
       <div className="min-h-screen pt-24 md:pt-28 pb-20 px-4
                       bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">
         <div className="max-w-6xl mx-auto">
           <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-bold mb-8">
             <Filter className="w-6 h-6" /> Модерация идей
           </h1>
   
           <div className="max-w-md mx-auto relative mb-6">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Поиск по названию…"
               className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
             />
           </div>
   
           {loading ? (
             <p className="text-center text-zinc-400">Загрузка…</p>
           ) : shown.length === 0 ? (
             <p className="text-center text-zinc-400">Новых предложений нет</p>
           ) : (
             <motion.div layout className="space-y-6">
               {shown.map(s => (
                 <motion.div
                   key={s.submission_id}
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 shadow-lg"
                 >
                   <h2 className="text-xl font-semibold mb-2">{s.title}</h2>
   
                   <p
                     className="text-sm text-zinc-300 whitespace-pre-wrap mb-4
                                max-h-[160px] overflow-y-auto scrollbar-thin
                                scrollbar-thumb-zinc-700"
                   >
                     {s.description}
                   </p>
   
                   <div className="flex flex-wrap gap-2 mb-4">
                     {s.tags.map(t => (
                       <span
                         key={t}
                         className="px-2 py-0.5 text-xs rounded-full bg-blue-800"
                       >
                         {t}
                       </span>
                     ))}
                   </div>
   
                   <p className="text-xs text-zinc-500 mb-4">
                     Автор: {s.user_email ?? '—'} ·{' '}
                     {new Date(s.created_at).toLocaleString()}
                   </p>
   
                   <div className="flex gap-3">
                     <button
                       onClick={() => decide(s.submission_id, true)}
                       className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                                  flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 className="w-4 h-4" /> Опубликовать
                     </button>
                     <button
                       onClick={() => decide(s.submission_id, false)}
                       className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500
                                  flex items-center justify-center gap-2"
                     >
                       <XCircle className="w-4 h-4" /> Отклонить
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
   