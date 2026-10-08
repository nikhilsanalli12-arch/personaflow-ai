import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GitCommit, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonaChangesPage() {
  const [changes, setChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChanges() {
      try {
        const res = await api.get('/persona/changes');
        if (res.data?.success) {
          setChanges(res.data.data.changes || []);
        }
      } catch (err) {
        console.error('Failed to load changes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChanges();
  }, []);

  const formatVal = (v) => {
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <GitCommit className="w-6 h-6 text-emerald-400" />
            What Changed? (State Transitions)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Requirement 31: Direct Before &rarr; Trigger &rarr; After audit representations.
          </p>
        </div>

        <Link
          to="/persona/timeline"
          className="text-xs text-brand-400 hover:underline"
        >
          View Full Timeline &rarr;
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Evaluating state changes...</div>
      ) : changes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          No state modifications recorded yet. Interacting with modules or quizzes will trigger evolutionary steps.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {changes.map((item, idx) => (
            <div
              key={item.id || idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-slate-800">
                    {item.fieldName || item.eventType}
                  </span>
                  <span className="text-xs text-slate-400">
                    Event: <strong className="text-slate-300">{item.eventType.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {item.confidence}% Confidence
                </span>
              </div>

              {/* Before -> Trigger -> After layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                {/* Before */}
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Before
                  </span>
                  <p className="text-xs font-mono text-slate-300 break-words">
                    {formatVal(item.before)}
                  </p>
                </div>

                {/* Trigger */}
                <div className="p-3.5 bg-brand-500/10 rounded-xl border border-brand-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold text-brand-400 block mb-1 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    Trigger Event
                  </span>
                  <p className="text-xs text-brand-200 font-medium">
                    {item.trigger}
                  </p>
                </div>

                {/* After */}
                <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                    After
                  </span>
                  <p className="text-xs font-mono text-emerald-200 font-bold break-words">
                    {formatVal(item.after)}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-right">
                Logged at: {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
