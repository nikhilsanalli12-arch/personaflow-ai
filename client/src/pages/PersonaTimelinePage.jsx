import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Sparkles, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonaTimelinePage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await api.get('/persona/timeline');
        if (res.data?.success) {
          setEvents(res.data.data.events || []);
        }
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTimeline();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-brand-400" />
            Persona Evolution Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit log tracking every adaptation made to your persona state.
          </p>
        </div>

        <Link
          to="/persona/changes"
          className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
        >
          View What Changed View &rarr;
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading audit history...</div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          Your persona will evolve as you interact with PersonaFlow.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 my-6">
          {events.map((ev, idx) => (
            <div key={ev.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-brand-500 group-hover:scale-125 transition-transform"></div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white capitalize px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60">
                      {ev.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      Field: <strong className="text-brand-300">{ev.field_name}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(ev.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {ev.reason}
                </p>

                {/* Old vs New State diff representation */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex-1 min-w-[120px]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Previous State</span>
                    <span className="text-slate-400 font-mono text-[11px] truncate block">
                      {typeof ev.oldValue === 'object' ? JSON.stringify(ev.oldValue) : String(ev.oldValue || '—')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-400 shrink-0" />
                  <div className="flex-1 min-w-[120px]">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Adapted State</span>
                    <span className="text-white font-mono text-[11px] font-semibold truncate block">
                      {typeof ev.newValue === 'object' ? JSON.stringify(ev.newValue) : String(ev.newValue || '—')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Confidence: <strong className="text-emerald-400">{ev.confidence}%</strong></span>
                  <span className="text-[10px] italic">Verified deterministic audit event</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
