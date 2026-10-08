import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, CheckCircle2, Cpu, Database, Sparkles } from 'lucide-react';

export default function AboutPage() {
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
          <h1 className="text-3xl font-extrabold text-white">About PersonaFlow AI</h1>
          <p className="mt-2 text-sm text-slate-400">
            Understand the User. Adapt the Experience. Evolve With Them.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">The Core Problem</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard recommendation platforms rely on static user surveys or coarse collaborative filtering. A user preparing for an interview tomorrow receives the same recommendations as someone idly reading articles. When users hit difficult concepts, typical platforms don't detect the friction or adapt the curriculum.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>PersonaFlow AI</strong> redefines personalization by separating <em>who you are</em> from <em>what you need right now</em>. It observes user behavior, quiz performance, and active modes to adapt recommendations, learning paths, and AI explanations in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <Cpu className="w-5 h-5 text-brand-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Deterministic Scoring</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Zero random recommendation numbers. Every score adheres strictly to 6 audited mathematical weights.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <Database className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white">PostgreSQL & Supabase</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Database-first architecture with transactional integrity, foreign keys, and audit logging.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Google Gemini Integration</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Backend-only AI provider with Zod structured output validation and automatic offline fallback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
