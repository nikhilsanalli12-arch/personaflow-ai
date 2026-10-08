import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import RecommendationCard from '../components/RecommendationCard';
import ContextSwitcher from '../components/ContextSwitcher';
import { Sparkles, RefreshCw, Search, Filter, CheckCircle2 } from 'lucide-react';

export default function RecommendationsPage() {
  const { currentContext, refreshPersona } = usePersonalization();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/recommendations');
      if (res.data?.success) {
        setRecommendations(res.data.data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentContext]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.post('/recommendations/refresh');
      if (res.data?.success) {
        setRecommendations(res.data.data.recommendations || []);
        setToastMessage('Recommendations re-scored and freshly ranked!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFeedback = async (contentId, feedbackType) => {
    try {
      const res = await api.post(`/recommendations/${contentId}/feedback`, { feedback: feedbackType });
      if (res.data?.success) {
        setRecommendations(res.data.data.recommendations || []);
        refreshPersona();
        setToastMessage(`Feedback "${feedbackType}" recorded!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (contentId) => {
    try {
      await api.post(`/recommendations/${contentId}/dismiss`);
      setRecommendations(prev => prev.filter(r => r.contentId !== contentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async (contentId) => {
    await api.post(`/recommendations/${contentId}/open`);
    window.location.href = `/content/${contentId}`;
  };

  // Filtered view
  const filtered = recommendations.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.topic.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === 'all' || item.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)}>&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-brand-400" />
            Adaptive Recommendation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic content ranking tailored to your active {currentContext} mode and recent behavior.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Recalculate Ranking</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recommended modules or topics..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Calculating recommendations...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          No matching recommendations found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <RecommendationCard
              key={item.id || item.contentId}
              item={item}
              onFeedback={handleFeedback}
              onOpen={handleOpen}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
