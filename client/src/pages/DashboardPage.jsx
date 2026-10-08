import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePersonalization } from '../context/PersonalizationContext';
import api from '../services/api';
import PersonaCard from '../components/PersonaCard';
import RecommendationCard from '../components/RecommendationCard';
import {
  Sparkles,
  RefreshCw,
  Compass,
  ArrowRight,
  TrendingUp,
  Target,
  Bot,
  HelpCircle,
  Map,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentContext, refreshPersona } = usePersonalization();
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard');
      if (res.data?.success) {
        setDashboardData(res.data.data);
        setRecommendations(res.data.data.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentContext]);

  // Requirement 120: Real Refresh Recommendations button
  const handleRefreshRecommendations = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.post('/recommendations/refresh');
      if (res.data?.success) {
        setRecommendations(res.data.data.recommendations || []);
        setActionSuccess('Recommendations freshly recalibrated based on your latest interactions!');
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real feedback handler
  const handleFeedback = async (contentId, feedbackType) => {
    try {
      const res = await api.post(`/recommendations/${contentId}/feedback`, {
        feedback: feedbackType
      });
      if (res.data?.success) {
        setRecommendations(res.data.data.recommendations || []);
        refreshPersona();
        setActionSuccess(`Feedback "${feedbackType}" recorded. Model updated.`);
        setTimeout(() => setActionSuccess(null), 3000);
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
    try {
      await api.post(`/recommendations/${contentId}/open`);
      window.location.href = `/content/${contentId}`;
    } catch (err) {
      window.location.href = `/content/${contentId}`;
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800"></div>
        <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-900 rounded-2xl border border-slate-800"></div>
          <div className="h-48 bg-slate-900 rounded-2xl border border-slate-800"></div>
          <div className="h-48 bg-slate-900 rounded-2xl border border-slate-800"></div>
        </div>
      </div>
    );
  }

  const primaryGoal = dashboardData?.primaryGoal;
  const recentChanges = dashboardData?.recentPersonaChanges || [];
  const analyticsSummary = dashboardData?.analyticsSummary || {};

  return (
    <div className="space-y-8">
      {/* Action toast confirmation */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Top Welcome & Mode Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                PersonaFlow Adaptive Co-Pilot
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Mode: <strong className="text-white">{currentContext}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Explorer'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Targeting: <strong className="text-slate-200">{primaryGoal?.title || 'Full-Stack Developer'}</strong> ({primaryGoal?.progress || 65}% progress)
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/assistant"
              className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Co-Pilot</span>
            </Link>

            <Link
              to="/quiz"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Assess Skill</span>
            </Link>

            <Link
              to="/learning/path"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Map className="w-4 h-4 text-emerald-400" />
              <span>Learning Path</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real KPIs derived from persisted data (Requirement 103) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Total Behavioral Signals Logged</p>
          <p className="text-2xl font-bold text-white mt-1">{analyticsSummary.totalInteractions || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Clicks, quizzes, completions & skips</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Recommendation Acceptance Rate</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{analyticsSummary.acceptanceRate || 100}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Useful vs Rejected feedback</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Goal Milestone Progression</p>
          <p className="text-2xl font-bold text-brand-400 mt-1">{analyticsSummary.averageGoalProgress || 0}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Calculated across active goals</p>
        </div>
      </div>

      {/* Dynamic Persona State Visualization */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Active Behavioral Profile
          </h3>
          <Link to="/persona" className="text-xs text-brand-400 hover:underline">
            Inspect Full Persona &rarr;
          </Link>
        </div>
        <PersonaCard />
      </div>

      {/* Real Recommendations Feed (Requirements 96, 97) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Tailored for {currentContext}
            </h3>
            <p className="text-xs text-slate-400">
              Scored deterministically using 6-dimension personal weights
            </p>
          </div>

          {/* Real Refresh Button (Requirement 120) */}
          <button
            onClick={handleRefreshRecommendations}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recalculate Ranking</span>
          </button>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id || rec.contentId}
                item={rec}
                onFeedback={handleFeedback}
                onOpen={handleOpen}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 glass-panel rounded-2xl text-center border border-slate-800">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">No active recommendations for this context.</p>
            <button
              onClick={handleRefreshRecommendations}
              className="mt-3 px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold"
            >
              Generate Recommendations
            </button>
          </div>
        )}
      </div>

      {/* Recent Persona Evolution Timeline Strip (Requirement 30, 31) */}
      {recentChanges.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Recent Persona Adaptations
            </h3>
            <Link to="/persona/timeline" className="text-xs text-brand-400 hover:underline">
              View Complete Audit Timeline &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentChanges.map((change) => (
              <div
                key={change.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0"></span>
                  <span className="font-semibold text-white capitalize">{change.eventType.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400">— {change.reason}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Confidence: {change.confidence}%</span>
                  <span>{new Date(change.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
