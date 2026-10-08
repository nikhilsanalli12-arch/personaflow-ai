import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, RefreshCw, Trash2, Eye, Lock, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { persona, resetPersona, toggleBehavioral, refreshPersona } = usePersonalization();

  const [profile, setProfile] = useState(null);
  const [goal, setGoal] = useState('');
  const [availableTime, setAvailableTime] = useState(30);
  const [learningStyle, setLearningStyle] = useState('hands-on');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/profile');
        if (res.data?.success) {
          const p = res.data.data;
          setProfile(p);
          setGoal(p.goal || '');
          setAvailableTime(p.availableTime || 30);
          setLearningStyle(p.learningStyle || 'hands-on');
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/profile', {
        goal,
        availableTime: parseInt(availableTime, 10),
        learningStyle
      });
      await refreshPersona();
      setToast('Explicit profile preferences saved and synchronized with persona.');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetPersona();
      setToast('Inferred persona signals reset to baseline onboarding state.');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHistory = async () => {
    try {
      await api.delete('/interactions');
      setShowDeleteConfirm(false);
      await refreshPersona();
      setToast('Interaction history permanently deleted and derived signals cleared.');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Toast */}
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
          <ShieldCheck className="w-6 h-6 text-brand-400" />
          Privacy Controls & Profile Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Requirement 33, 34, 35: Complete autonomy over your data, persona reset, and behavioral adaptation.
        </p>
      </div>

      {/* Section 1: Explicit Preferences */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Explicit Preferences ("You told us")
        </h3>
        <p className="text-xs text-slate-400">
          These attributes are authoritative and define the baseline for recommendations and AI assistance.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Active Career / Learning Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Available Focus Time (Minutes)</label>
              <input
                type="number"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Learning Format</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="hands-on">Hands-on (Projects & Code)</option>
                <option value="visual">Visual (Diagrams & Architecture)</option>
                <option value="reading">Deep Reading (Specifications)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Update Explicit Profile'}</span>
          </button>
        </form>
      </div>

      {/* Section 2: Privacy & Behavioral Adaptations (Requirement 33 & 34) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Behavioral Personalization Switch (Requirement 34)
        </h3>
        <p className="text-xs text-slate-400">
          When disabled, PersonaFlow will NOT track interaction history or infer struggle areas. The experience will rely exclusively on your explicit onboarding profile.
        </p>

        <div className="flex items-center justify-between p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <div>
            <p className="text-xs font-semibold text-white">Enable Behavioral Inference</p>
            <p className="text-[11px] text-slate-500">
              Permit real-time adaptation from quiz performance, clicks, and module completions.
            </p>
          </div>
          <button
            onClick={() => toggleBehavioral(!persona?.behavioralPersonalizationEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              persona?.behavioralPersonalizationEnabled ? 'bg-brand-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                persona?.behavioralPersonalizationEnabled ? 'left-7' : 'left-1'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Section 3: Reset Persona (Requirement 32) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Reset Inferred Persona Signals (Requirement 32)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Clears all inferred struggle areas, recent interest tags, and skill upgrades. Restores your persona state to your baseline onboarding profile while preserving your account and goals.
        </p>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
          <span>Reset Inferred Signals</span>
        </button>
      </div>

      {/* Section 4: Delete Interaction History (Requirement 35) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-900/40 space-y-4">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Delete Interaction History (Requirement 35)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Permanently removes all interaction records (views, clicks, searches, quiz attempts) and recalculates the persona without historical traces. This action cannot be reversed.
        </p>

        {showDeleteConfirm ? (
          <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl space-y-3">
            <p className="text-xs text-rose-300 font-semibold">
              Are you sure you want to purge all interaction history?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteHistory}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Yes, Purge Completely
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Interaction History</span>
          </button>
        )}
      </div>
    </div>
  );
}
