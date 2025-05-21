/* ────────────────────────────────────────────────────────────────
   src/pages/Assistant.tsx                                   v2.0
   Показываем ВСЮ историю чата (user + assistant) из Supabase
   и подписываемся в ре-тайме. Вопросы — только в Telegram-боте
   @BizIdeasTrendsBot. На сайте — «read-only»-просмотр.
────────────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef }     from 'react';
import { motion, AnimatePresence }         from 'framer-motion';
import { Bot, ExternalLink, Loader2 }      from 'lucide-react';
import toast                               from 'react-hot-toast';

import { supabase }     from '../lib/supabase';
import { useAuth }      from '../contexts/AuthContext';
import { useLanguage }  from '../contexts/LanguageContext';

/* ─────────────── helpers ─────────────── */
type Role = 'user' | 'assistant';
interface ChatMsg { id: string; role: Role; content: string }

const toChatMsg = (row: any): ChatMsg => ({
  id:      row.message_id ?? row.id,   // Realtime присылает message_id
  role:    row.role,
  content: row.content,
});

const roboAvatar = (id: string) =>
  `https://robohash.org/${encodeURIComponent(id)}?set=set4&size=80x80`;

/* ─────────────── component ─────────────── */
export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const { t }    = useLanguage();

  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  /* ───── load + realtime subscribe ───── */
  useEffect(() => {
    if (!user?.user_id) { setBusy(false); return; }

    let sub: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      /* последняя сессия пользователя */
      const { data: sess, error: e1 } = await supabase
        .from('chat_sessions')
        .select('session_id')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (e1) { toast.error(e1.message); setBusy(false); return; }
      if (!sess?.session_id) { setBusy(false); return; }

      /* вся история */
      const { data: history, error: e2 } = await supabase
        .from('chat_messages')
        .select('message_id,role,content,created_at')
        .eq('session_id', sess.session_id)
        .order('created_at');

      if (e2) { toast.error(e2.message); setBusy(false); return; }
      setMsgs((history ?? []).map(toChatMsg));
      setBusy(false);

      /* realtime подписка */
      sub = supabase.channel('chat:' + sess.session_id)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sess.session_id}` },
          payload => setMsgs(m => [...m, toChatMsg(payload.new)])
        )
        .subscribe();
    };

    init();
    return () => { sub?.unsubscribe(); };
  }, [user]);

  /* ─────────────── UI ─────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">

      {/* top-bar */}
      <header className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
        <Bot className="w-5 h-5 text-indigo-400" />
        <h1 className="font-semibold">AI-Assistant</h1>
      </header>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 relative">

        {/* welcome overlay */}
        {msgs.length === 0 && !busy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-300 px-4 select-none"
          >
            <Bot className="w-12 h-12 mb-6 text-indigo-400" />
            <h2 className="text-2xl font-bold mb-3">Переписка в Telegram</h2>
            <p className="max-w-lg leading-relaxed">
              Задавайте вопросы в&nbsp;
              <a
                href="https://t.me/BizIdeasTrendsBot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 underline font-semibold"
              >
                @BizIdeasTrendsBot
              </a>,<br />
              а здесь мгновенно появятся ответы и ваши сообщения.
            </p>
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {msgs.map(m => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* avatar */}
                {m.role !== 'user' && (
                  <div className="mr-2 shrink-0">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl leading-relaxed whitespace-pre-line max-w-[80%] sm:max-w-[75%]
                    ${m.role === 'user'
                      ? 'bg-indigo-700/60 backdrop-blur-md'
                      : 'bg-zinc-800/70 backdrop-blur-md'}`}
                  dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }}
                />

                {m.role === 'user' && (
                  <div className="ml-2 shrink-0">
                    <img
                      src={roboAvatar(user?.user_id ?? 'anon')}
                      className="w-8 h-8 rounded-full shadow-md"
                    />
                  </div>
                )}
              </motion.div>
            ))}

            {busy && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-4"
              >
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* CTA footer */}
      <footer className="border-t border-white/10 bg-black/60 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto text-center">
          <a
            href="https://t.me/BizIdeasTrendsBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                       px-4 py-2 rounded-xl font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть чат-бот
          </a>
          <p className="text-xs text-gray-400 mt-2">
            История синхронизируется автоматически.
          </p>
        </div>
      </footer>
    </div>
  );
};
