/* ────────────────────────────────────────────────────────────────
   src/pages/Assistant.tsx   (дополнили проверкой выбранной идеи)
────────────────────────────────────────────────────────────────── */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import { Bot, Send, Loader2 }           from 'lucide-react';
import toast                            from 'react-hot-toast';

import { supabase }    from '../lib/supabase';
import { useAuth }     from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

/* ---------- helpers ---------- */
type MsgRole = 'user' | 'assistant' | 'typing';
interface ChatMsg { id: string; role: MsgRole; content: string }
const robo = (id: string) =>
  `https://robohash.org/${encodeURIComponent(id)}?set=set4&size=80x80`;

const Typing = () => (
  <div className="flex gap-1 py-0.5">
    {[0,1,2].map(i=>(
      <span key={i}
        className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{animationDelay:`${i*0.2}s`}}/>
    ))}
  </div>
);

/* ---------- component ---------- */
export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const { t }    = useLanguage();

  const [msgs,setMsgs] = useState<ChatMsg[]>([]);
  const [inp,setInp]   = useState('');
  const [busy,setBusy] = useState(false);
  const [allow,setAllow] = useState(true);               // лимит standard

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs]);

  /* тарифное ограничение */
  useEffect(()=>{
    if(!user) return;
    const unlimited = ['plus','admin'].includes(user.status ?? '');
    if(unlimited) return setAllow(true);
    setAllow(msgs.filter(m=>m.role==='assistant').length===0);
  },[msgs,user]);

  /* ---------- send ---------- */
  const send = async () => {
    const question = inp.trim();
    if(!question || busy) return;

    if(!allow){
      toast('⚡  Безлимитный помощник доступен в плане BizIdeas Plus');
      return;
    }

    /* ─── ПРОВЕРКА: выбрана ли идея ─── */
    if(user?.user_id){
      const { data: selected } = await supabase
        .from('userideas')
        .select('idea_id')
        .eq('user_id', user.user_id)
        .single();

      if(!selected?.idea_id){
        toast.error('Сначала выберите идею в разделе «Идеи», чтобы я мог дать персональную рекомендацию.');
        return;
      }
    }

    /* отправка */
    const meta = crypto.randomUUID();
    setMsgs(m=>[...m,{id:meta+'u',role:'user',content:question},
                     {id:meta+'t',role:'typing',content:''}]);
    setInp(''); setBusy(true);

    /* профиль для контекста */
    const { data: prof } = user?.email
      ? await supabase.from('users')
          .select('region,business_sector,transition_goal,experience_lvl,telegram,user_text')
          .eq('email',user.email).single()
      : { data:null };

    try{
      const r = await fetch('/api/recommend',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ question, profile:prof, locale:t('lang')??'ru' })
      });
      const { answer } = await r.json();

      setMsgs(m=>m.filter(x=>x.id!==meta+'t')
                  .concat({id:meta+'a',role:'assistant',content:answer}));
    }catch{
      toast.error('Сервер не ответил. Попробуйте позднее');
      setMsgs(m=>m.filter(x=>x.id!==meta+'t'));
    }
    setBusy(false);
  };

  const onKey = (e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col
                    bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">

      {/* top-bar */}
      <header className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
        <Bot className="w-5 h-5 text-indigo-400"/><h1 className="font-semibold">AI-Assistant</h1>
      </header>

      {/* chat */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 relative">
        {/* приветствие */}
        {msgs.length===0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:0.6}}
            className="absolute inset-0 flex flex-col items-center justify-center
                       text-center text-gray-300 px-4 select-none pointer-events-none">
            <Bot className="w-12 h-12 mb-6 text-indigo-400"/>
            <h2 className="text-2xl font-bold mb-3">Привет! 👋</h2>
            <p className="max-w-lg leading-relaxed">
              Я&nbsp;помогаю адаптировать ваш бизнес под выбранную идею и&nbsp;актуальные
              тренды. Задайте вопрос&nbsp;— предложу конкретные шаги трансформации.
              <br/>
              <span className="text-indigo-400 font-semibold">
                Первый ответ&nbsp;— бесплатно. Безлимит&nbsp;— в плане Plus.
              </span>
            </p>
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {msgs.map(m=>(
              <motion.div key={m.id}
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                transition={{duration:0.25}}
                className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                {/* avatar */}
                {m.role!=='user' && (
                  <div className="mr-2 shrink-0">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center
                                    justify-center shadow-md">
                      <Bot className="w-4 h-4"/>
                    </div>
                  </div>
                )}
                {/* bubble */}
                <div className={`px-4 py-2 rounded-2xl leading-relaxed
                                 max-w-[80%] sm:max-w-[75%]
                                 ${m.role==='user'
                                   ?'bg-indigo-700/60 backdrop-blur-md'
                                   :'bg-zinc-800/70 backdrop-blur-md'}`}>
                  {m.role==='typing'?<Typing/>:m.content}
                </div>
                {m.role==='user' && (
                  <div className="ml-2 shrink-0">
                    <img src={robo(user?.user_id??'anon')}
                         className="w-8 h-8 rounded-full shadow-md"/>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* input */}
      <form onSubmit={e=>{e.preventDefault();send();}}
            className="border-t border-white/10 bg-black/60 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea rows={1}
            placeholder="Спросите про трансформацию бизнеса…"
            value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={onKey}
            disabled={busy||!allow}
            className="flex-1 resize-none rounded-xl bg-zinc-800/70 px-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-indigo-600
                       disabled:opacity-40"/>
          <button type="submit"
            disabled={busy||!inp.trim()||!allow}
            className="shrink-0 h-10 w-10 rounded-xl grid place-items-center
                       bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
          </button>
        </div>
      </form>

      {/* upsell */}
      {!allow && (
        <motion.div initial={{y:80}} animate={{y:0}} exit={{y:80}}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 px-6 py-3
                     bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600
                     rounded-full shadow-lg text-sm">
          Безлимитный ассистент&nbsp;—&nbsp;
          <span className="underline cursor-pointer"
                onClick={()=>toast('Раздел «Подписки» скоро!')}>оформите Plus</span>
        </motion.div>
      )}
    </div>
  );
};
