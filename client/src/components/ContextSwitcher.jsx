import React from 'react';
import { usePersonalization } from '../context/PersonalizationContext';
import { Compass, Hammer, Briefcase, GraduationCap, Target } from 'lucide-react';

const CONTEXT_ICONS = {
  'Learning': Compass,
  'Building Project': Hammer,
  'Interview Preparation': Briefcase,
  'Exam Preparation': GraduationCap,
  'Career Planning': Target
};

export default function ContextSwitcher({ onContextSwitched }) {
  const { currentContext, availableContexts, switchContext, isLoading } = usePersonalization();

  const handleSelect = async (mode) => {
    if (mode === currentContext || isLoading) return;
    await switchContext(mode);
    if (onContextSwitched) onContextSwitched(mode);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Active Context:
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {availableContexts.map((mode) => {
          const Icon = CONTEXT_ICONS[mode] || Compass;
          const isActive = currentContext === mode;
          return (
            <button
              key={mode}
              onClick={() => handleSelect(mode)}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{mode}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
