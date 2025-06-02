/* ────────────────────────────────────────────────────────────────
   src/pages/Ideas.tsx
   • лайк  💙
   • пустые / крайние состояния + toast
   • hotkeys ← / → / Esc
   • progress-bar вместо цифры popularity
   • похожие идеи в модалке
   • FAB «Предложить» в правом нижнем углу
────────────────────────────────────────────────────────────────── */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Tag, HelpCircle, Plus, Lightbulb,
  Heart, HeartOff, X as Close,
} from 'lucide-react';
import Joyride, { STATUS, Step, CallBackProps } from 'react-joyride';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate }  from 'react-router-dom';
import toast            from 'react-hot-toast';

import { supabase }         from '../lib/supabase';
import { useLanguage }      from '../contexts/LanguageContext';
import { useAuth }          from '../contexts/AuthContext';
import { BUSINESS_SECTORS } from '../contexts/constants';
import FancyTooltip         from '../components/FancyTooltip';
import mascotImg            from './logos/mascot.png';

/* ---------- types ---------- */
interface Idea {
  idea_id: number;
  title: string;
  description: string;
  tags: string[];
  popularity_score: number | null;
}

/* ---------- const ---------- */
const PAGE_SIZE  = 6;
const SWIPE_TRSH = 40;

/* ---------- joy-steps ---------- */
const steps: Step[] = [
  { target:'#filter-chip-ИТ',   content:'Используйте теги для фильтра.' },
  { target:'#chip-liked',       content:'Отобразите только понравившиеся.' },
  { target:'#idea-card-1',      content:'Откройте подробности идеи.' },
  { target:'#ideas-pagination', content:'Переключайте страницы.' },
  { target:'#fab-suggest',      content:'Добавьте свою идею!' },
];

/* ------------------------------------------------------------------ */
export default function Ideas() {
  const { t }     = useLanguage();
  const { user }  = useAuth();
  const nav       = useNavigate();

  /* ───── state ───── */
  const [ideas, setIdeas]         = useState<Idea[]>([]);
  const [selectedTags, setTags]   = useState<string[]>([]);
  const [liked, setLiked]         = useState<number[]>(
    () => JSON.parse(localStorage.getItem('liked_ideas') || '[]'),
  );
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [expanded, setExpanded]   = useState<Idea | null>(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  const [userId,   setUserId]     = useState<number | null>(null);
  const [mainIdea, setMainIdea]   = useState<number | null>(null);
  const [saving,   setSaving]     = useState(false);

  const [mascotWiggle, setWiggle] = useState(false);
  const [guide, setGuide]         = useState(
    !localStorage.getItem('guide_ideas_seen'),
  );

  const swipeX = useRef<number | null>(null);

  /* ───── initial data ───── */
  useEffect(() => {
    document.title = 'BizIdeas | Идеи';

    supabase.from('trendingideas').select('*').then(({ data }) => {
      setIdeas(data ?? []);
      setLoading(false);
      if ((data ?? []).length === 0) {
        toast('Пока идей нет – добавьте свою! 😊', { icon: '💡' });
      }
    });

    if (user?.email) {
      supabase
        .from('users')
        .select('user_id')
        .eq('email', user.email)
        .single()
        .then(({ data }) => setUserId(data?.user_id ?? null));

      supabase
        .from('userideas')
        .select('idea_id')
        .eq('user_id', user.user_id)
        .single()
        .then(({ data }) => setMainIdea(data?.idea_id ?? null));
    }
  }, [user]);

  /* ───── helpers ───── */
  const toggleTag = (tg: string) => {
    setTags(p => (p.includes(tg) ? p.filter(x => x !== tg) : [...p, tg]));
    setPage(1);
    setWiggle(true);
    setTimeout(() => setWiggle(false), 600);
  };

  const toggleLike = (id: number) => {
    setLiked(p => {
      const next = p.includes(id) ? p.filter(x => x !== id) : [...p, id];
      localStorage.setItem('liked_ideas', JSON.stringify(next));
      toast(
        next.includes(id) ? 'Добавлено в избранное' : 'Убрано из избранного',
        { icon: next.includes(id) ? '💙' : '💔' },
      );
      return next;
    });
  };

  const chooseIdea = async () => {
    if (!userId || !expanded) return;
    if (mainIdea && mainIdea !== expanded.idea_id) {
      if (!confirm('Идея уже выбрана. Заменить?')) return;
    }
    setSaving(true);
    await supabase
      .from('userideas')
      .upsert(
        [
          {
            user_id: userId,
            idea_id: expanded.idea_id,
            saved_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id' },
      );
    setSaving(false);
    setMainIdea(expanded.idea_id);
    toast.success('Идея сохранена как основная');
  };

  /* ───── filter + pagination ───── */
  let list = ideas;
  if (selectedTags.length)
    list = list.filter(i => i.tags.some(t => selectedTags.includes(t)));
  if (onlyLiked) list = list.filter(i => liked.includes(i.idea_id));

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const slice = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ───── похожие идеи (по первому тегу) ───── */
  const related = useMemo(() => {
    if (!expanded) return [];
    const tag = expanded.tags[0];
    return ideas
      .filter(
        i => i.idea_id !== expanded.idea_id && i.tags.includes(tag),
      )
      .slice(0, 3);
  }, [expanded, ideas]);

  /* ───── touch swipe ───── */
  const onStart = (e: React.TouchEvent) =>
    (swipeX.current = e.touches[0].clientX);
  const onEnd = (e: React.TouchEvent) => {
    if (swipeX.current === null) return;
    const diff = e.changedTouches[0].clientX - swipeX.current;
    if (diff > SWIPE_TRSH && page > 1) setPage(p => p - 1);
    if (diff < -SWIPE_TRSH && page < pages) setPage(p => p + 1);
    swipeX.current = null;
  };

  /* ───── keyboard shortcuts ───── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && page < pages) setPage(p => p + 1);
      if (e.key === 'ArrowLeft' && page > 1) setPage(p => p - 1);
      if (e.key === 'Escape' && expanded) setExpanded(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, pages, expanded]);

  /* ───── joyride ───── */
  const onJoy = (d: CallBackProps) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(d.status as STATUS)) {
      localStorage.setItem('guide_ideas_seen', 'yes');
      setGuide(false);
    }
  };

  /* ---------- ui ---------- */
  return (
    <div
      className="pt-20 min-h-screen bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white
                 pb-40 sm:pb-20 px-4 relative overflow-hidden"
      onTouchStart={onStart}
      onTouchEnd={onEnd}
    >
      <Joyride
        run={guide}
        steps={steps}
        continuous
        showProgress
        showSkipButton
        disableScrolling
        tooltipComponent={FancyTooltip}
        styles={{ options: { primaryColor: '#6366f1', zIndex: 9999 } }}
        callback={onJoy}
      />

      {/* header */}
      <div className="flex items-center gap-3 max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold flex-1">
          {t('trendingIdeas') || 'Популярные идеи'}
        </h1>
        <button
          aria-label="Запустить обучение"
          onClick={() => {
            localStorage.removeItem('guide_ideas_seen');
            setGuide(true);
          }}
          className="p-2 rounded hover:bg-white/10"
        >
          <HelpCircle className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* chips */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3">Темы</h2>

          <div className="flex flex-wrap gap-2">
            {BUSINESS_SECTORS.map(tg => (
              <button
                key={tg}
                id={`filter-chip-${tg}`}
                onClick={() => toggleTag(tg)}
                className={`px-3 py-1 rounded-full text-sm flex items-center
                             transition-colors
                             ${
                               selectedTags.includes(tg)
                                 ? 'bg-blue-600 text-white'
                                 : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                             }`}
              >
                <Tag className="w-4 h-4 mr-1" />
                {tg}
              </button>
            ))}

            <button
              id="chip-liked"
              onClick={() => setOnlyLiked(p => !p)}
              className={`px-3 py-1 rounded-full text-sm flex items-center
                           transition-colors
                           ${
                             onlyLiked
                               ? 'bg-pink-600 text-white'
                               : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                           }`}
            >
              {onlyLiked ? (
                <Heart className="w-4 h-4 mr-1" />
              ) : (
                <HeartOff className="w-4 h-4 mr-1" />
              )}
              Понравившиеся
            </button>
          </div>
        </section>

        {/* grid */}
        {loading ? (
          <Skeleton />
        ) : slice.length === 0 ? (
          <EmptyState
            message={onlyLiked ? 'Пока нет понравившихся идей' : 'Подходящих идей не найдено'}
            action={onlyLiked ? () => setOnlyLiked(false) : () => setTags([])}
            actionLabel={onlyLiked ? 'Показать все' : 'Сбросить фильтр'}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((idea, idx) => (
              <IdeaCard
                key={idea.idea_id}
                idea={idea}
                idx={idx}
                liked={liked.includes(idea.idea_id)}
                toggleLike={toggleLike}
                open={() => setExpanded(idea)}
              />
            ))}
          </div>
        )}


        {/* pagination */}
        {pages > 1 && (
          <nav
            id="ideas-pagination"
            className="flex justify-center mt-10 gap-2"
            aria-label="Пагинация"
          >
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`w-8 h-8 rounded-full text-sm font-semibold
                             ${
                               page === p
                                 ? 'bg-white text-black'
                                 : 'bg-gray-800 hover:bg-gray-700'
                             }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* mascot */}
      <div className="hidden sm:block absolute bottom-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none">
        <div
          className={`relative w-64 h-36 sm:w-[500px] sm:h-[300px] overflow-hidden
                       transition-transform ${
                         mascotWiggle ? 'animate-wiggle' : ''
                       }`}
        >
          <img src={mascotImg} alt="" className="w-full h-auto" />
        </div>
      </div>

      {/* FAB */}
      <motion.button
        id="fab-suggest"
        initial={{ scale: 0, y: 80 }}
        animate={{
          scale: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 260, damping: 20 },
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => nav('/suggest-idea')}
        className="fixed bottom-5 sm:bottom-7 right-4 sm:right-8 z-30 flex items-center gap-2
                     bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-5 py-3 rounded-full
                     text-white font-semibold shadow-xl shadow-teal-800/40 backdrop-blur-lg"
      >
        <Plus className="w-5 h-5" /> Предложить идею
      </motion.button>

      {/* modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setExpanded(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-xl w-full bg-gray-900 rounded-xl p-6 shadow-lg"
            >
              <button
                aria-label="Закрыть"
                onClick={() => setExpanded(null)}
                className="absolute -top-3 -right-3 bg-gray-800 w-7 h-7 rounded-full
                             grid place-content-center hover:bg-gray-700"
              >
                <Close className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-bold mb-4">{expanded.title}</h2>
              <p className="text-gray-300 mb-4 whitespace-pre-line">
                {expanded.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {expanded.tags.map(t => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-800"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <Progress val={expanded.popularity_score ?? 0} />

              <div className="flex flex-col sm:flex-row gap-3 my-6">
                <button
                  onClick={chooseIdea}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                               flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {mainIdea
                    ? mainIdea === expanded.idea_id
                      ? 'Выбрано ✅'
                      : 'Заменить идею'
                    : 'Выбрать идею'}
                </button>
                <button
                  onClick={() => nav('/suggest-idea')}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500
                               flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" /> Предложить похожую
                </button>
              </div>

              {/* похожие */}
              {related.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Похожие идеи</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {related.map(r => (
                      <button
                        key={r.idea_id}
                        onClick={() => setExpanded(r)}
                        className="bg-zinc-800/70 p-3 rounded-lg text-left text-xs hover:bg-zinc-700"
                      >
                        <p className="font-semibold line-clamp-2 mb-1">
                          {r.title}
                        </p>
                        <Progress mini val={r.popularity_score ?? 0} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- components ---------- */
function IdeaCard({
  idea,
  idx,
  liked,
  toggleLike,
  open,
}: {
  idea: Idea;
  idx: number;
  liked: boolean;
  toggleLike: (id: number) => void;
  open: () => void;
}) {
  return (
    <article
      id={`idea-card-${idx === 0 ? 1 : idea.idea_id}`}
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl shadow-md
                 hover:shadow-xl hover:scale-[1.03] transition cursor-pointer relative group"
      onClick={open}
    >
      <button
        aria-label="Like"
        onClick={e => {
          e.stopPropagation();
          toggleLike(idea.idea_id);
        }}
        className="absolute top-3 right-3 text-pink-400 opacity-70 hover:opacity-100
                   transition-transform origin-center active:scale-75"
      >
        {liked ? (
          <Heart className="w-5 h-5 fill-current" />
        ) : (
          <HeartOff className="w-5 h-5" />
        )}
      </button>

      <h3 className="text-lg font-semibold mb-2 pr-6">{idea.title}</h3>
      <p className="text-sm text-gray-300 line-clamp-3">{idea.description}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {idea.tags.map(t => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full bg-blue-800"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <Progress val={idea.popularity_score ?? 0} />
      </div>
    </article>
  );
}


function Progress({ val, mini }: { val: number; mini?: boolean }) {
  return (
    <>
      <div className={`${mini ? 'h-1' : 'h-1.5'} rounded-full bg-zinc-700`}>
        <div
          style={{ width: `${val}%` }}
          className={`h-full rounded-full ${
            mini ? 'bg-cyan-300' : 'bg-cyan-400'
          }`}
        />
      </div>
      {!mini && (
        <p className="text-[10px] text-gray-400 mt-1">
          Popularity {val.toFixed(0)}%
        </p>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="h-40 bg-zinc-800/70 rounded-xl"
        />
      ))}
    </div>
  );
}

function EmptyState({
  message,
  action,
  actionLabel,
}: {
  message: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <div className="text-center py-20 text-gray-400 select-none">
      <p className="mb-4">{message}</p>
      <button
        onClick={action}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium"
      >
        {actionLabel}
      </button>
    </div>
  );
}
