import React, { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface Idea {
  idea_id: number;
  title: string;
  description: string;
  tags: string[];
  popularity_score: number;
}

const PAGE_SIZE = 6;

export const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // новый state
  const { t } = useLanguage();
  const { user } = useAuth();

  const ALL_TAGS = ['IT', 'AI', 'Marketing', 'Eco', 'FoodTech', 'Sustainability', 'Health', 'Fitness', 'Automation', 'Retail'];

  useEffect(() => {
    const loadIdeas = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('trendingideas').select('*');
      if (error) console.error('Ошибка загрузки идей:', error.message);
      else setIdeas(data || []);
      setLoading(false);
    };

    const loadUserInfo = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', user.email)
          .single();

        if (data?.user_id) {
          setUserId(data.user_id);

          // подгрузим выбранную идею
          const { data: ideaData, error: ideaError } = await supabase
            .from('userideas')
            .select('idea_id')
            .eq('user_id', data.user_id)
            .single();

          if (ideaData) {
            setSelectedIdeaId(ideaData.idea_id);
          } else if (ideaError && ideaError.code !== 'PGRST116') {
            console.error('Ошибка загрузки выбранной идеи:', ideaError.message);
          }
        } else {
          console.error('Не удалось получить user_id:', error?.message);
        }
      }
    };

    loadIdeas();
    loadUserInfo();
  }, [user]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setCurrentPage(1);
  };

  const handleChooseIdea = async () => {
    if (!userId || !expanded) {
      alert('Пользователь не найден или идея не выбрана');
      return;
    }

    if (selectedIdeaId && selectedIdeaId !== expanded.idea_id) {
      const confirmReplace = window.confirm('У тебя уже выбрана идея. Заменить её?');
      if (!confirmReplace) return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('userideas')
      .upsert([
        {
          user_id: userId,
          idea_id: expanded.idea_id,
          saved_at: new Date().toISOString()
        }
      ], { onConflict: 'user_id' });

    if (error) {
      alert('Ошибка при сохранении идеи: ' + error.message);
    } else {
      setSelectedIdeaId(expanded.idea_id);
      alert('Идея выбрана!');
    }

    setSaving(false);
  };

  const filteredIdeas = ideas.filter(idea =>
    selectedTags.length === 0 || idea.tags?.some(tag => selectedTags.includes(tag))
  );

  const pageCount = Math.ceil(filteredIdeas.length / PAGE_SIZE);
  const currentIdeas = filteredIdeas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-black text-white py-12 relative">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">{t('trendingIdeas') || 'Trending Business Ideas'}</h1>

        {/* Теги */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('filterByTags') || 'Filter by Tags'}</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm flex items-center transition ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <Tag className="h-4 w-4 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Карточки */}
        {loading ? (
          <div className="text-center text-gray-400">Загрузка идей...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentIdeas.map(idea => (
              <div
                key={idea.idea_id}
                onClick={() => setExpanded(idea)}
                className="cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 hover:from-purple-800 hover:to-indigo-900 rounded-xl p-5 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-3">{idea.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {idea.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-800 text-white">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  📈 {t('popularity') || 'Popularity'}: {idea.popularity_score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пагинация */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-10 gap-3">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-sm font-semibold ${
                  currentPage === page
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Модалка */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full bg-gray-900 text-white rounded-xl p-6 shadow-lg"
          >
            {/* Кнопка справа сверху */}
            <button
              onClick={handleChooseIdea}
              disabled={saving}
              className="absolute top-4 right-4 px-4 py-1 text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
            >
              {selectedIdeaId === expanded.idea_id ? 'Выбрано ✅' : saving ? 'Сохраняем...' : 'Выбрать идею'}
            </button>

            <h2 className="text-2xl font-bold mb-4">{expanded.title}</h2>
            <p className="text-gray-300 mb-4">{expanded.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {expanded.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-800 text-white">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              📈 {t('popularity') || 'Popularity'}: {expanded.popularity_score.toFixed(1)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
