import React from 'react';
import { usePersonalization } from '../context/PersonalizationContext';
import { UserCheck, ShieldAlert, Sparkles, RefreshCw, Zap, TrendingUp, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonaCard() {
  const { persona, resetPersona, toggleBehavioral, isLoading } = usePersonalization();

  if (!persona) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  const {
    skillLevel,
    currentFocus,
    goal,
    currentContext,
    confidence = 80,
    struggleAreas = [],
    recentInterests = [],
    version = 1,
    provenance = {},
    behavioralPersonalizationEnabled = true
  } = persona;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Dynamic Adaptive Persona</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                v{version}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continuously evolved from behavior, assessments, and context
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <Link
            to="/persona/changes"
            className="text-xs text-brand-400 hover:text-brand-300 font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            What Changed?
          </Link>
          <button
            onClick={resetPersona}
            disabled={isLoading}
            title="Reset inferred behavioral signals"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Reset Inferred
          </button>
        </div>
      </div>

      {/* Grid of key persona dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        {/* Assessed Skill */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Skill Level</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {provenance.skillLevel?.label || 'Inferred'}
            </span>
          </div>
          <p className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400"></span>
            {skillLevel}
          </p>
        </div>

        {/* Current Focus */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Current Focus</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Active</span>
          </div>
          <p className="text-sm font-bold text-white truncate">{currentFocus}</p>
        </div>

        {/* Confidence Meter */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Persona Confidence</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Struggle Areas & Recent Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Struggle Areas (Requirement 43) */}
        <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Detected Struggle Areas
            </span>
            <span className="text-[10px] text-slate-500 italic">Inferred from quiz & skips</span>
          </div>
          {struggleAreas.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {struggleAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No current struggle areas detected.</p>
          )}
        </div>

        {/* Recent Inferred Interests */}
        <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Recent Topic Interests
            </span>
            <span className="text-[10px] text-slate-500 italic">Inferred from activity</span>
          </div>
          {recentInterests.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {recentInterests.map((interest, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Exploring foundational concepts.</p>
          )}
        </div>
      </div>

      {/* Behavioral Personalization Toggle (Requirement 34) */}
      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Behavioral Personalization:</span>
          <span
            className={`font-semibold ${
              behavioralPersonalizationEnabled ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {behavioralPersonalizationEnabled ? 'Active (Adapting live)' : 'Disabled (Explicit only)'}
          </span>
        </div>
        <button
          onClick={() => toggleBehavioral(!behavioralPersonalizationEnabled)}
          className="text-xs text-brand-400 hover:text-brand-300 underline"
        >
          {behavioralPersonalizationEnabled ? 'Disable live behavior' : 'Enable live behavior'}
        </button>
      </div>
    </div>
  );
}
