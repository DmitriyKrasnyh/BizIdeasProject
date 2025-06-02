/* ────────────────────────────────────────────────────────────────
   src/pages/Assistant.tsx
   • История диалогов (read-only)
   • Joy-ride-гайд c кастомным FancyTooltip
────────────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion }     from 'framer-motion';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import {
  Bot, ExternalLink, Loader2, HelpCircle,
} from 'lucide-react';
import toast               from 'react-hot-toast';

import FancyTooltip        from '../components/FancyTooltip';
import { supabase }        from '../lib/supabase';
import { useAuth }         from '../contexts/AuthContext';

/* ───────── helpers ───────── */
type Role = 'user'|'assistant';
interface ChatMsg { id:string; role:Role; content:string }

const toChatMsg = (row:any):ChatMsg => ({
  id:      row.message_id ?? row.id,
  role:    row.role,
  content: row.content,
});

const roboAvatar = (id:string)=>
  `https://robohash.org/${encodeURIComponent(id)}?set=set4&size=80x80`;

/* ───────── Joy-ride steps ───────── */
const steps:Step[] = [
  { target:'#assistant-header',   content:'История ваших диалогов с ИИ-помощником.' },
  { target:'#tg-link',            content:'Нажмите, чтобы задать вопрос боту в Telegram.' },
  { target:'#chat-scroll-anchor', content:'Новые ответы появляются здесь автоматически.' },
  { target:'#open-bot-btn',       content:'Кликните, чтобы открыть бота.' },
];

/* ═════════════════════════ component ═════════════════════════ */
export const Assistant:React.FC = () => {
  const { user } = useAuth();

  const [msgs,setMsgs]   = useState<ChatMsg[]>([]);
  const [busy,setBusy]   = useState(true);

  const [runGuide,setRunGuide] = useState(
    !localStorage.getItem('guide_assistant_seen'),
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),[msgs]);
  
    document.title = 'BizIdeas | AI';
  /* ───── fetch chat + realtime ───── */
  useEffect(()=>{
    if(!user?.user_id){ setBusy(false); return; }

    let sub:ReturnType<typeof supabase.channel>|null = null;

    (async()=>{
      const { data:sess } = await supabase
        .from('chat_sessions')
        .select('session_id')
        .eq('user_id',user.user_id)
        .order('created_at',{ascending:false})
        .limit(1).maybeSingle();

      if(!sess?.session_id){ setBusy(false); return; }

      const { data:history,error } = await supabase
        .from('chat_messages')
        .select('message_id,role,content,created_at')
        .eq('session_id',sess.session_id)
        .order('created_at');

      if(error){ toast.error(error.message); setBusy(false); return; }
      setMsgs((history??[]).map(toChatMsg));
      setBusy(false);

      /* realtime subscribe */
      sub = supabase.channel('chat:'+sess.session_id)
        .on('postgres_changes',
          { event:'INSERT', schema:'public', table:'chat_messages',
            filter:`session_id=eq.${sess.session_id}` },
          p=>setMsgs(m=>[...m,toChatMsg(p.new)]))
        .subscribe();
    })();

    return ()=>{ sub?.unsubscribe(); };
  },[user]);

  /* ───── Joy-ride cb ───── */
  const onJoy=(d:CallBackProps)=>{
    if([STATUS.FINISHED,STATUS.SKIPPED].includes(d.status as STATUS)){
      localStorage.setItem('guide_assistant_seen','yes');
      setRunGuide(false);
    }
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br
                    from-[#100018] via-[#070111] to-black text-white">

      <Joyride
        steps={steps}
        run={runGuide}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        disableScrolling={false}
        tooltipComponent={FancyTooltip}
        styles={{ options:{ zIndex:9999, primaryColor:'#6366f1' } }}
        callback={onJoy}
      />

      {/* header */}
      <header id="assistant-header"
              className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
        <Bot className="w-5 h-5 text-indigo-400"/>
        <h1 className="font-semibold">AI-Assistant</h1>
      </header>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 relative">

        {/* welcome overlay */}
        {msgs.length===0 && !busy && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:0.85}}
            className="absolute inset-0 flex flex-col items-center justify-center
                       text-center text-gray-300 px-4 select-none space-y-4">
            <Bot className="w-12 h-12 text-indigo-400"/>
            <h2 className="text-2xl font-bold">Переписка в&nbsp;Telegram</h2>
            <p className="max-w-lg leading-relaxed">
              Задавайте вопросы в&nbsp;
              <a id="tg-link" href="https://t.me/BizIdeasTrendsBot"
                 target="_blank" rel="noopener noreferrer"
                 className="text-indigo-400 underline font-semibold">
                @BizIdeasTrendsBot
              </a>,&nbsp;а здесь увидите ответы.
            </p>
          </motion.div>
        )}

        {/* message list */}
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {msgs.map(m=>(
              <motion.div key={m.id}
                initial={{opacity:0,y:10}}
                animate={{opacity:1,y:0}}
                exit={{opacity:0}}
                transition={{duration:0.25}}
                className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>

                {m.role!=='user' && (
                  <div className="mr-2 shrink-0">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex
                                    items-center justify-center shadow-md">
                      <Bot className="w-4 h-4"/>
                    </div>
                  </div>
                )}

                <div dangerouslySetInnerHTML={{__html:m.content.replace(/\n/g,'<br/>')}}
                     className={`px-4 py-2 rounded-2xl whitespace-pre-line leading-relaxed
                                 max-w-[80%] sm:max-w-[75%]
                      ${m.role==='user'
                        ?'bg-indigo-700/60 backdrop-blur-md'
                        :'bg-zinc-800/70 backdrop-blur-md'}`}/>

                {m.role==='user' && (
                  <img src={roboAvatar(user?.user_id??'anon')}
                       className="ml-2 w-8 h-8 rounded-full shadow-md"/>
                )}
              </motion.div>
            ))}

            {busy && (
              <motion.div key="loader"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400"/>
              </motion.div>
            )}
          </AnimatePresence>
          <div id="chat-scroll-anchor" ref={bottomRef}/>
        </div>
      </div>

      {/* footer */}
      <footer className="border-t border-white/10 bg-black/60 backdrop-blur
                         px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto text-center">
          <a id="open-bot-btn"
             href="https://t.me/BizIdeasTrendsBot" target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                        px-4 py-2 rounded-xl font-medium">
            <ExternalLink className="w-4 h-4"/> Открыть чат-бот
          </a>
          <p className="text-xs text-gray-400 mt-2">
            История синхронизируется автоматически.
          </p>
        </div>
      </footer>

      {/* floating help button — поверх навбара, всегда кликабельно */}
      <button
        onClick={()=>{
          localStorage.removeItem('guide_assistant_seen');
          setRunGuide(true);
        }}
        id="assistant-help-btn"
        className="fixed bottom-5 right-5 z-40 bg-zinc-900/80 backdrop-blur
                   hover:bg-zinc-800 p-2 rounded-full shadow-lg"
        aria-label="Обучение"
      >
        <HelpCircle className="w-5 h-5 text-gray-300"/>
      </button>
    </div>
  );
};
