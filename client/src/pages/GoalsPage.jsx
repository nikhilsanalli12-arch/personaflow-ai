import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { Target, Plus, CheckCircle2, Trash2, Calendar, Sparkles, TrendingUp } from 'lucide-react';

export default function GoalsPage() {
  const { refreshPersona } = usePersonalization();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('high');

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/goals');
      if (res.data?.success) {
        setGoals(res.data.data.goals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.post('/goals', {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString()
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      await fetchGoals();
      await refreshPersona();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProgressChange = async (goalId, newProgress) => {
    try {
      await api.put(`/goals/${goalId}`, { progress: parseInt(newProgress, 10) });
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress: parseInt(newProgress, 10) } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-brand-400" />
            Active Goals & Priorities
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Requirement 46 & 47: Goals guide recommendation alignment (25% weight) and learning path generation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Establish New Goal</span>
        </button>
      </div>

      {/* Goals list */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          No goals established yet. Create your first target to anchor personalization.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => (
            <div
              key={g.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      g.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}
                  >
                    {g.priority} Priority
                  </span>
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {g.target_date ? new Date(g.target_date).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{g.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{g.description}</p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Completion Milestone</span>
                  <span className="font-mono font-bold text-brand-400">{g.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={g.progress}
                  onChange={(e) => handleProgressChange(g.id, e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleDeleteGoal(g.id)}
                  title="Remove goal"
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Career or Technical Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Cloud Deployment with Render and Vercel"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe key outcomes and milestones..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
