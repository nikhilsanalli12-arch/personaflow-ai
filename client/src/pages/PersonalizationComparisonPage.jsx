import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { SplitSquareVertical, Sparkles, ShieldAlert, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function PersonalizationComparisonPage() {
  const { currentContext } = usePersonalization();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchComparison() {
      try {
        setIsLoading(true);
        const res = await api.get('/recommendations/comparison');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchComparison();
  }, [currentContext]);

  if (isLoading) return <div className="p-12 text-center text-slate-500">Comparing recommendation models...</div>;

  const personalized = data?.personalized || [];
  const baseline = data?.genericBaseline || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <SplitSquareVertical className="w-6 h-6 text-brand-400" />
          Before / After Personalization Comparison
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Requirement 36 & 37: Auditing the tangible contrast between a generic static baseline and PersonaFlow's adaptive intelligence.
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
          Architectural Contrast Principle
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {data?.explanation ||
            'Generic recommendations only reflect static category popularity. PersonaFlow personalized recommendations dynamically adapt based on active goals, live context mode, assessed skill level, and detected struggle areas.'}
        </p>
      </div>

      {/* Side-by-side comparison columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Generic Baseline (Requirement 37) */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-300">Generic Baseline Experience</h3>
              <p className="text-[11px] text-slate-500">Calculated without behavioral personalization</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              Static Catalog
            </span>
          </div>

          <div className="space-y-3">
            {baseline.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-2 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    #{idx + 1} {item.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{item.score}% Baseline</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                <div className="text-[10px] text-slate-500 italic">
                  Ranked solely on general introductory difficulty.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: PersonaFlow Adaptive Personalization (Requirement 38) */}
        <div className="space-y-4">
          <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                PersonaFlow Adaptive Experience
              </h3>
              <p className="text-[11px] text-brand-300">
                Mode: {currentContext} • Scored with active persona
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Adaptive
            </span>
          </div>

          <div className="space-y-3">
            {personalized.map((item, idx) => (
              <div
                key={item.id || idx}
                className="glass-panel p-4 rounded-2xl border border-brand-500/20 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    #{idx + 1} {item.title}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-brand-400">
                    {item.score}% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">{item.description}</p>

                {/* Specific Explainability Reasons */}
                {item.reasons && item.reasons.length > 0 && (
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-emerald-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                    <span>{item.reasons[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
