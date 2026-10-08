import React from 'react';
import { X, Sparkles, CheckCircle2, ShieldAlert, Info, ArrowUpRight } from 'lucide-react';

export default function WhyAmISeeingThisModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const { contentTitle, finalScore, breakdown = [], confidence, struggleAreaAddressed } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Why Am I Seeing This?
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium border border-brand-500/30">
                  {finalScore}% Match
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">{contentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Targeted Intervention Alert if addressing struggle */}
          {struggleAreaAddressed && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Targeted Skill Reinforcement
                </h4>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  PersonaFlow detected a potential struggle area in <strong>"{struggleAreaAddressed}"</strong> based on recent quiz scores and interaction skips. This module was dynamically prioritized to help strengthen understanding.
                </p>
              </div>
            </div>
          )}

          {/* 6-Dimensional Personalization Breakdown (Requirement 15 & 24) */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Scoring Weight Composition (Normalized 0–100)
            </h4>
            <div className="space-y-3">
              {breakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">{item.criterion}</span>
                    <span className="font-mono font-bold text-brand-400">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, item.score)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-500 italic">
                      {item.criterion.includes('Goal') || item.criterion.includes('Preference')
                        ? 'You told us'
                        : 'PersonaFlow inferred'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence and TrustGuard statement (Requirement 25, 26, 106) */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  PersonaFlow Confidence Assessment
                </p>
                <p className="text-[11px] text-slate-400">
                  PersonaFlow currently believes this fits your current need. (Deterministic scoring)
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-400">{confidence}%</span>
              <p className="text-[10px] text-slate-500">Confidence</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
