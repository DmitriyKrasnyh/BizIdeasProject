import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'assistant' | 'typing';
  content: string;
}

export const Assistant = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [inp, setInp] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* автоскролл вниз */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  /* отправка вопроса */
  const ask = async () => {
    const question = inp.trim();
    if (!question) return;

    /* выводим пользовательское сообщение */
    setMsgs(m => [...m, { role: 'user', content: question }]);
    setInp('');

    /* вставляем «typing…» */
    setMsgs(m => [...m, { role: 'typing', content: '' }]);

    /* user_id для сервера */
    let uid: number | null = null;
    if (user?.email) {
      const { data } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', user.email)
        .single();
      uid = data?.user_id ?? null;
    }

    /* запрос к API */
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ biz_desc: question, user_id: uid }),
    });
    const { answer } = await res.json();

    /* убираем «typing…», добавляем ответ */
    setMsgs(m => [
      ...m.filter(msg => msg.role !== 'typing'),
      { role: 'assistant', content: answer },
    ]);
  };

  /* клавиатура */
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">
      {/* header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <Bot className="w-6 h-6 text-indigo-400" />
        <h1 className="text-xl font-semibold">AI-Assistant</h1>
      </div>

      {/* чат */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`max-w-[85%] p-4 rounded-xl whitespace-pre-wrap shadow ${
                m.role === 'user'
                  ? 'ml-auto bg-indigo-800/40'
                  : m.role === 'assistant'
                  ? 'mr-auto bg-gray-800/60'
                  : 'mr-auto'
              }`}
            >
              {m.role === 'typing' ? (
                <TypingDots />
              ) : (
                m.content
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* input-панель */}
      <form
        onSubmit={e => {
          e.preventDefault();
          ask();
        }}
        className="border-t border-white/10 p-4 bg-black/50 backdrop-blur flex gap-3"
      >
        <textarea
          rows={1}
          placeholder={t('describeBiz') || 'Опишите свой бизнес…'}
          value={inp}
          onChange={e => setInp(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 resize-none bg-gray-800/70 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />

        <button
          type="submit"
          disabled={!inp.trim()}
          className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          {t('ask') || 'Спросить'}
        </button>
      </form>
    </div>
  );
};

/* три мигающие точки */
function TypingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
