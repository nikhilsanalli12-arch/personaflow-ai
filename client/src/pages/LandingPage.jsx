import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Compass,
  Cpu,
  BarChart2,
  RefreshCw,
  Layers,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const { loginAsDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              PersonaFlow<span className="text-brand-400">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white rounded-xl text-xs font-medium hover:bg-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleDemoClick}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Try Demo (Alex)
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Understand the User. Adapt the Experience. Evolve With Them.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            AI That Continuously Adapts to What You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-blue-500">
              Need Right Now.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Most digital experiences personalize for who you were yesterday. PersonaFlow AI learns from your live context, assessments, and struggles to transform recommendations and AI assistance in real time.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <span>Start Personalized Experience</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleDemoClick}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Try Interactive Demo</span>
            </button>
          </div>

          {/* Signature Differentiators Strip (Requirement 127) */}
          <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
            {[
              { title: 'Adaptive Loop', desc: 'Behavioral signals trigger live model evolution' },
              { title: 'Why Am I Seeing This?', desc: 'Deterministic 6-metric explainability' },
              { title: 'Before vs After', desc: 'Side-by-side static vs adaptive comparison' },
              { title: 'Context Modes', desc: 'Instant shifting between 5 operational modes' },
              { title: 'Persona Evolution', desc: 'Auditable timeline of what changed & why' }
            ].map((feature, idx) => (
              <div key={idx} className="p-3 bg-slate-900/50 border border-slate-800/70 rounded-xl">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                  {feature.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Loop Conceptual Diagram (Requirement Master Core Loop) */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The PersonaFlow Adaptive Feedback Loop
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              USER → INTERACTION → BEHAVIOR SIGNAL → DYNAMIC PERSONA → CURRENT CONTEXT → PERSONALIZATION ENGINE → RECOMMENDATION → EXPLANATION → USER FEEDBACK → EVOLUTION
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. Real-Time Context Switching</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Whether you switch from "Learning" to "Building Project" or "Interview Preparation", the 20% context weight immediately restructures recommendation rankings and AI explanations.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. Assessment & Struggle Detection</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Low quiz scores or repeated skipped modules automatically trigger detected struggle areas, prioritizing targeted reinforcement instead of blindly showing advanced material.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. Deterministic Explainability</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Every recommendation presents an uncompromised breakdown of Goal Match (25%), Skill Match (20%), Context (20%), Interest (15%), Preference (10%), and Feedback (10%).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Product Line & Footer (Requirement Final Product Line) */}
      <footer className="mt-auto py-12 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <blockquote className="text-base sm:text-lg font-medium text-slate-300 italic">
            "PersonaFlow doesn't just personalize for who you are. It adapts to what you need right now."
          </blockquote>
          <p className="mt-4 text-xs text-slate-500">
            PersonaFlow AI &copy; 2026. Built with React, Vite, Node.js, PostgreSQL/Supabase, and Google Gemini.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy & TrustGuard</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
