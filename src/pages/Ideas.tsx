// src/pages/Ideas.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Tag, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import mascotImg from './logos/mascot.png';
import { BUSINESS_SECTORS } from '../contexts/constants.ts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Idea {
  idea_id: number;
  title: string;
  description: string;
  tags: string[];
  popularity_score: number | null;
}

const PAGE_SIZE = 6;

export const Ideas: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  /* state */
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [mascotReact, setMascotReact] = useState(false);

  /* swipe */
  const touchStartX = useRef<number | null>(null);

  /* загрузка идей + userInfo */
  useEffect(() => {
    document.title = "BizIdeas | Идеи";
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('trendingideas').select('*');
      if (error) console.error('Ошибка загрузки идей:', error.message);
      else setIdeas(data ?? []);
      setLoading(false);
    })();

    (async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', user.email)
        .single();

      if (!data?.user_id) return;
      setUserId(data.user_id);

      const { data: ideaData } = await supabase
        .from('userideas')
        .select('idea_id')
        .eq('user_id', data.user_id)
        .single();

      if (ideaData) setSelectedIdeaId(ideaData.idea_id);
    })();
  }, [user]);

  /* фильтры & пагинация */
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
    setMascotReact(true);
    setTimeout(() => setMascotReact(false), 800);
  };

  const filteredIdeas = ideas.filter(
    idea =>
      selectedTags.length === 0 ||
      idea.tags?.some(tag => selectedTags.includes(tag))
  );

  const pageCount = Math.ceil(filteredIdeas.length / PAGE_SIZE);
  const currentIdeas = filteredIdeas.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* выбор идеи */
  const handleChooseIdea = async () => {
    if (!userId || !expanded) return;

    if (selectedIdeaId && selectedIdeaId !== expanded.idea_id) {
      const ok = window.confirm('У тебя уже выбрана идея. Заменить её?');
      if (!ok) return;
    }

    setSaving(true);
    const { error } = await supabase.from('userideas').upsert(
      [
        {
          user_id: userId,
          idea_id: expanded.idea_id,
          saved_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id' }
    );
    setSaving(false);

    if (error) alert(error.message);
    else setSelectedIdeaId(expanded.idea_id);
  };

  /* свайпы */
  const handleTouchStart = (e: React.TouchEvent) =>
    (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50 && currentPage > 1) setCurrentPage(p => p - 1);
    if (diff < -50 && currentPage < pageCount) setCurrentPage(p => p + 1);
    touchStartX.current = null;
  };

  return (
    /* pt-20 ⇒ отступ 80 px — навбару не даём перекрывать контент */
    <div
      className="pt-20 min-h-screen bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white pb-10 px-4 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          {t('trendingIdeas') || 'Популярные бизнес-идеи'}
        </h1>

        {/* Фильтр по тегам */}
        <div className="mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3">
            {t('filterByTags') || 'Фильтр по темам'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_SECTORS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm flex items-center transition ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Tag className="h-4 w-4 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* карточки */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentIdeas.map(idea => (
              <article
                key={idea.idea_id}
                onClick={() => setExpanded(idea)}
                className="cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 hover:from-purple-800 hover:to-indigo-900 rounded-xl p-5 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {idea.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {idea.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-blue-800 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  📈 popularity: {idea.popularity_score?.toFixed(1) ?? '—'}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* пагинация */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-10 gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-sm font-semibold ${
                  currentPage === page
                    ? 'bg-white text-black'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* маскот */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none">
        <div
          className={`relative w-72 h-40 sm:w-[600px] sm:h-[350px] overflow-hidden transition-transform duration-500 ${
            mascotReact ? 'animate-wiggle' : ''
          }`}
        >
          <img src={mascotImg} alt="Mascot" className="w-full h-auto" />
        </div>
      </div>

      {/* плавающая кнопка AI-ассистента */}
      <motion.button
        initial={{ scale: 0, y: 100 }}
        animate={{
          scale: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 260, damping: 20 },
        }}
        whileHover={{ scale: 1.08, rotate: 1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => navigate('/assistant')}
        className="fixed bottom-8 right-8 z-30 flex items-center gap-2 bg-gradient-to-br
                   from-indigo-500 via-purple-600 to-pink-600 px-5 py-3 rounded-full
                   text-white font-semibold shadow-xl shadow-purple-900/40 backdrop-blur-lg"
      >
        <Bot className="w-5 h-5" />
        AI-помощник
      </motion.button>

      {/* модалка детали */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full bg-gray-900 text-white rounded-xl p-6 shadow-lg"
          >
            <button
              onClick={handleChooseIdea}
              disabled={saving}
              className="absolute top-4 right-4 px-4 py-1 text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition"
            >
              {selectedIdeaId === expanded.idea_id
                ? 'Выбрано ✅'
                : saving
                ? 'Сохраняем…'
                : 'Выбрать идею'}
            </button>
            <h2 className="text-2xl font-bold mb-4">{expanded.title}</h2>
            <p className="text-gray-300 mb-4">{expanded.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {expanded.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-800 text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              📈 popularity: {expanded.popularity_score?.toFixed(1) ?? '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* маленький скелет-лоадер */
function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="h-40 bg-gray-800/70 rounded-xl" />
      ))}
    </div>
  );
}
