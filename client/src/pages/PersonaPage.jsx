import React from 'react';
import { usePersonalization } from '../context/PersonalizationContext';
import PersonaCard from '../components/PersonaCard';
import { UserCheck, Sparkles, ShieldCheck, History, GitCommit, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonaPage() {
  const { persona, resetPersona, isLoading } = usePersonalization();

  if (!persona) return <div className="p-12 text-center text-slate-500">Loading persona...</div>;

  const { provenance = {}, signals = [] } = persona;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-brand-400" />
            Dynamic Adaptive Persona
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            PersonaFlow AI continuously maps your skills, friction points, and active operational context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/persona/timeline"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-brand-400" />
            Evolution Timeline
          </Link>
          <Link
            to="/persona/changes"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <GitCommit className="w-4 h-4 text-emerald-400" />
            What Changed?
          </Link>
        </div>
      </div>

      {/* Main Persona Card */}
      <PersonaCard />

      {/* Explicit vs Inferred Provenance Table (Requirement 7) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Attribute Provenance & Belief Classification (Requirement 7)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicitly distinguishing user-provided facts from algorithmic behavioral inferences.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Persona Dimension</th>
                <th className="py-2.5 px-3">Current Active Value</th>
                <th className="py-2.5 px-3">Classification Origin</th>
                <th className="py-2.5 px-3">Transparency Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Active Goal</td>
                <td className="py-3 px-3 text-white">{persona.goal}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    USER_PROVIDED
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 italic">"You told us"</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Learning Style</td>
                <td className="py-3 px-3 text-white capitalize">{persona.learningStyle}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    USER_PROVIDED
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 italic">"You told us"</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Assessed Skill Level</td>
                <td className="py-3 px-3 text-white capitalize">{persona.skillLevel}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                    {provenance.skillLevel?.origin || 'INFERRED'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 italic">{provenance.skillLevel?.label || 'PersonaFlow inferred'}</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Detected Struggle Areas</td>
                <td className="py-3 px-3 text-white">
                  {persona.struggleAreas.length > 0 ? persona.struggleAreas.join(', ') : 'None identified'}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    INFERRED
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 italic">"PersonaFlow inferred from quiz assessments"</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-200">Recent Topic Interests</td>
                <td className="py-3 px-3 text-white">
                  {persona.recentInterests.length > 0 ? persona.recentInterests.join(', ') : 'None'}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                    INFERRED
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400 italic">"PersonaFlow inferred from content views"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Behavioral Signals Inventory */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Supporting Signal Evidence Log ({signals.length})
          </h3>
          <button
            onClick={resetPersona}
            disabled={isLoading}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Purge Inferred Signals
          </button>
        </div>

        {signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {signals.map((sig, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white capitalize">{sig.type}: {sig.value}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{sig.confidence}% conf</span>
                </div>
                <p className="text-[11px] text-slate-400">{sig.reason}</p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1">
                  <span>Source: {sig.source}</span>
                  {sig.count && <span>• Observed {sig.count}x</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No behavioral signals currently active.</p>
        )}
      </div>
    </div>
  );
}
