import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, RefreshCw, Trash2, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">PersonaFlow AI</span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Privacy Architecture & Responsible AI Disclosure
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Adhering strictly to Requirements 7, 9, 33, 105, and 106.
          </p>
        </div>

        {/* Responsible AI Disclaimer (Requirement 106) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Responsible AI & Probabilistic Modeling Transparency
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            PersonaFlow AI models behavioral patterns as <strong>probabilistic beliefs</strong> rather than absolute truths. We never claim 100% accuracy, flawless personalization, or guaranteed learning outcomes. When persona confidence is evaluated, it is computed deterministically using evidentiary support, frequency, and recency decay.
          </p>
        </div>

        {/* Non-sensitive Signals vs Prohibited (Requirement 9) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Allowed Non-Sensitive Signals
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Technical topic engagement (React, Node.js, SQL)</li>
              <li>Assessed skill level via quiz submissions</li>
              <li>Learning format preferences (hands-on vs visual)</li>
              <li>Identified struggle concepts from quiz errors</li>
              <li>Active context mode (Learning, Project, Interview)</li>
              <li>Available time blocks (10, 30, 60 minutes)</li>
            </ul>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Prohibited & Blocked Attributes
            </h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Race or ethnic origins</li>
              <li>Religious beliefs or affiliations</li>
              <li>Political ideology or political activity</li>
              <li>Sexual orientation or gender identity</li>
              <li>Medical conditions or biometric health data</li>
              <li>Any other sensitive demographic traits</li>
            </ul>
          </div>
        </div>

        {/* User Privacy Rights & Controls (Requirement 33, 34, 35) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Your Complete Privacy Controls</h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <Eye className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong>Full Provenance Transparency:</strong> Every recommendation explains whether each criteria stems from explicit data ("You told us") or behavioral inference ("PersonaFlow inferred").
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <RefreshCw className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong>Instant Persona Reset:</strong> Users can reset all inferred struggle areas and behavioral tags at any time while preserving explicit onboarding profiles and goal progress.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Purge Interaction History:</strong> Users can permanently delete all logged click, search, and quiz interactions with automated persona recalibration.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
