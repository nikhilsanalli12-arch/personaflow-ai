import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, BookOpen, Activity, Plus, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Content form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Backend');
  const [topic, setTopic] = useState('Node.js');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [contentType, setContentType] = useState('tutorial');
  const [duration, setDuration] = useState(30);
  const [tags, setTags] = useState('Backend, Node.js, Express');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setIsLoading(true);
        const [aRes, uRes, cRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users'),
          api.get('/admin/content')
        ]);
        if (aRes.data?.success) setAnalytics(aRes.data.data);
        if (uRes.data?.success) setUsers(uRes.data.data.users || []);
        if (cRes.data?.success) setContentList(cRes.data.data.content || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/admin/content', {
        title,
        description,
        category,
        topic,
        difficulty,
        contentType,
        duration: parseInt(duration, 10),
        tags: tagArr
      });
      setToast('Content created successfully!');
      setTitle('');
      setDescription('');
      setTimeout(() => setToast(null), 3000);
      const cRes = await api.get('/admin/content');
      if (cRes.data?.success) setContentList(cRes.data.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-12 text-center text-rose-400 font-semibold">
        Access Denied. Administrator credentials required.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}>&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          Admin Oversight Console
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Requirement 104: Administrative inspection of user cohorts, curriculum inventory, and system event counts.
        </p>
      </div>

      {/* Top metrics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-white mt-1">{analytics.totalUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Curriculum Modules</p>
            <p className="text-2xl font-bold text-brand-400 mt-1">{analytics.totalContentItems}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Interactions Logged</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{analytics.totalInteractionsRecorded}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Persona Adaptations</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{analytics.totalPersonaAdaptations}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {['overview', 'users', 'content', 'create'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Registered Users ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 px-3 font-semibold text-white">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Content Inventory */}
      {activeTab === 'content' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Curriculum Modules ({contentList.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentList.map((c) => (
              <div key={c.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.title}</span>
                  <span className="text-[10px] uppercase font-bold text-brand-400">{c.category}</span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2">{c.description}</p>
                <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-3">
                  <span className="capitalize">{c.difficulty}</span>
                  <span>• {c.duration} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Create Content */}
      {activeTab === 'create' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Publish New Curriculum Module</h3>
          <form onSubmit={handleCreateContent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Module Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Caching with Redis"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive technical overview..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="interactive_project">Interactive Project</option>
                  <option value="exercise">Exercise</option>
                  <option value="deep_dive">Deep Dive</option>
                  <option value="interview_prep">Interview Prep</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Module</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Overview */}
      {activeTab === 'overview' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">System Architecture & Health</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            PersonaFlow AI backend is fully active with PostgreSQL database storage, deterministic 6-dimensional scoring engines, and live Gemini API integration with offline fallback.
          </p>
        </div>
      )}
    </div>
  );
}
