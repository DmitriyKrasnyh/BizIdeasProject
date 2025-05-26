// src/pages/Faq.tsx
// ---------------------------------------------------------------
// Расширенный FAQ:
//  • 20+ вопросов
//  • Поддержка мини-markdown (*italic*  **bold**  `code`  [link](url))
//  • Списки «- пункт» превращаются в ul/li
// ---------------------------------------------------------------
import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FaqItem {
  id: number;
  question: string;
  answer: string;  // markdown-подобный текст (\n = новый абзац)
  category: string;
}

const FAQ_DATA: FaqItem[] = [
  // ——— ОБЩЕЕ ————————————————————————————————————————
  {
    id: 1,
    category: 'Общее',
    question: 'Что такое BizIdeas?',
    answer:
      'BizIdeas — это платформа, которая продаёт **вдохновение** и аналитику для начинающих предпринимателей.\nМы собираем тренды и подсказываем, как запустить бизнес.',
  },
  {
    id: 2,
    category: 'Общее',
    question: 'Почему идеи «трендовые»?',
    answer:
      'Мы анализируем *тысячи* источников: соцсети, поисковые запросы, отчёты венчурных фондов.\nАлгоритм измеряет *скорость роста* упоминаний → рассчитывает `popularity_score` (0-100).',
  },
  {
    id: 3,
    category: 'Общее',
    question: 'Можно ли предложить свою идею?',
    answer:
      '- Да! Перейдите в раздел **Submit Idea**.\n- Опишите концепцию и целевую аудиторию.\n- Команда модерации проверит и опубликует, если всё ок.',
  },

  // ——— ПОДПИСКА ——————————————————————————————————————
  {
    id: 10,
    category: 'Подписка',
    question: 'Чем планы Standard и Plus отличаются?',
    answer:
      '**Standard** — бесплатный доступ к витрине идей + 1 запрос к AI.\n**Plus** даёт:\n- безлимитный AI-ассистент;\n- расширенную аналитику;\n- ранний доступ к новым функциям;\n- приоритетную поддержку.',
  },
  {
    id: 11,
    category: 'Подписка',
    question: 'Могу ли я отменить подписку?',
    answer:
      'Конечно. `Настройки → Подписка → Отменить`.\nДоступ остаётся до конца оплаченного периода.',
  },
  {
    id: 12,
    category: 'Подписка',
    question: 'Есть ли пробный период?',
    answer:
      'При первой покупке **Plus** активируется *7 дней trial*. Деньги списываются только после пробного периода.',
  },

  // ——— ПЛАТЕЖИ ———————————————————————————————————————
  {
    id: 20,
    category: 'Платежи',
    question: 'Какие способы оплаты поддерживаются?',
    answer:
      'Stripe принимает:\n- банковские карты **Visa / MasterCard / Мир**;\n- **Apple Pay** и **Google Pay**;\n- некоторые локальные методы в зависимости от страны.',
  },
  {
    id: 21,
    category: 'Платежи',
    question: 'Вы делаете возвраты?',
    answer:
      'Да. Напишите на support@bizideas.ai c темой `Refund`.\n- Возврат возможен в течение 7 дней;\n- Если вы сделали ≤ 3 запроса к AI.',
  },
  {
    id: 22,
    category: 'Платежи',
    question: 'Где получить чек для бухгалтерии?',
    answer:
      'После успешного платежа мы шлём чек на e-mail, привязанный к Stripe-аккаунту. Не пришло — проверьте *спам* или напишите нам.',
  },

  // ——— AI-АССИСТЕНТ ————————————————————————————————————
  {
    id: 30,
    category: 'AI-ассистент',
    question: 'На каком движке работает AI?',
    answer:
      'В основе GPT-4o от OpenAI + собственный fine-tune на данных малого бизнеса.\nМодель хостится в **Франкфурте** → минимальная задержка для СНГ.',
  },
  {
    id: 31,
    category: 'AI-ассистент',
    question: 'Есть ли ограничения в Plus?',
    answer:
      'У нас действует *fair-use policy*: ≤ 300 запросов в месяц, чтобы моделям хватало мощности на всех.',
  },
  {
    id: 32,
    category: 'AI-ассистент',
    question: 'Какие типы запросов поддерживаются?',
    answer:
      '- генерация бизнес-плана;\n- расчёт юнит-экономики;\n- подбор каналов привлечения;\n- перевод pitch-deck на 🇬🇧;\n- **любые** уточняющие вопросы по идее.',
  },

  // ——— БЕЗОПАСНОСТЬ ———————————————————————————————————
  {
    id: 40,
    category: 'Безопасность',
    question: 'Как храните платежные данные?',
    answer:
      'Мы **не** храним данные карт. Всё обрабатывает Stripe, который соответствует PCI DSS Level 1.',
  },
  {
    id: 41,
    category: 'Безопасность',
    question: 'Данные идей приватны?',
    answer:
      'Ваши пометки и сохранённые идеи видны только вам. База шифруется *at-rest* (AES-256) и *in-transit* (TLS 1.3).',
  },

  // ——— ROADMAP ————————————————————————————————————————
  {
    id: 50,
    category: 'Roadmap',
    question: 'Что планируется в 2025 году?',
    answer:
      '- мобильное приложение на iOS/Android;\n- интеграция с Notion;\n- генерация финансовых моделей в Excel/Sheets;\n- маркетплейс экспертов для консультаций.',
  },
];

const CATEGORIES = ['Все', ...Array.from(new Set(FAQ_DATA.map(f => f.category)))];

// ──────────────────────────────────────────────────────────────
export const Faq: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('Все');
  const [openId, setOpenId] = useState<number | null>(null);

  // фильтрация
  const filteredFaq = useMemo(() => {
    let items = FAQ_DATA;
    if (activeCat !== 'Все') items = items.filter(f => f.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return items;
  }, [query, activeCat]);

  // very-mini markdown → html
  const md = (text: string) =>
    text
      // ссылки [txt](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-400 underline" target="_blank" rel="noopener">$1</a>')
      // **bold**
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // *italic*
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // `code`
      .replace(/`([^`]+)`/g, '<code class="bg-zinc-800/60 px-1.5 py-0.5 rounded text-indigo-300">$1</code>');

  // превращаем \n-списки «- » в <ul></ul>
  const renderParagraphs = (answer: string) => {
    const lines = answer.split(/\n/);
    const chunks: (string | string[])[] = [];
    let buffer: string[] = [];

    lines.forEach(l => {
      if (l.trim().startsWith('- ')) {
        buffer.push(l.trim().slice(2));
      } else {
        if (buffer.length) {
          chunks.push([...buffer]);
          buffer = [];
        }
        chunks.push(l);
      }
    });
    if (buffer.length) chunks.push([...buffer]);

    return chunks.map((c, idx) => {
      if (Array.isArray(c)) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 mb-3">
            {c.map((li, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: md(li) }} />
            ))}
          </ul>
        );
      }
      return <p key={idx} className="mb-3" dangerouslySetInnerHTML={{ __html: md(c as string) }} />;
    });
  };

  // ───────────────────────── ui
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-20 px-4 bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Часто задаваемые вопросы</h1>

      {/* search */}
      <div className="max-w-xl mx-auto relative mb-8">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Найдите ответ…"
          className="w-full py-3 pl-12 pr-4 rounded-xl bg-zinc-800/70 backdrop-blur placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
      </div>

      {/* tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeCat === cat ? 'bg-indigo-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="max-w-3xl mx-auto divide-y divide-zinc-800">
        {filteredFaq.map(item => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="py-4 select-none">
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full flex justify-between items-start text-left gap-4"
              >
                <span className="font-medium sm:text-lg leading-snug">{item.question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 text-zinc-300 leading-relaxed">
                      {renderParagraphs(item.answer)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredFaq.length === 0 && (
          <p className="text-center py-16 text-zinc-400">Не нашли ничего по запросу… 😔</p>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto text-center mt-20">
        <p className="mb-4 text-lg font-medium">Не нашли ответа?</p>
        <button
          onClick={() => navigate('/support')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-full font-semibold transition"
        >
          <Send className="w-4 h-4" /> Написать в поддержку
        </button>
      </div>
    </div>
  );
};