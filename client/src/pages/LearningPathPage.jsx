import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { Map, CheckCircle2, Clock, ShieldAlert, Sparkles, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LearningPathPage() {
  const { currentContext } = usePersonalization();
  const [pathData, setPathData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLearningPath() {
      try {
        setIsLoading(true);
        const res = await api.get('/learning/path');
        if (res.data?.success) {
          setPathData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLearningPath();
  }, [currentContext]);

  if (isLoading) return <div className="p-12 text-center text-slate-500">Generating adaptive learning path...</div>;

  const steps = pathData?.steps || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Map className="w-6 h-6 text-brand-400" />
          Adaptive Curriculum Milestone Path
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Requirement 40 & 41: Deterministically ordered by active goal, skill prerequisites, and struggle area interventions.
        </p>
      </div>

      {/* Progress & KPI Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Goal</span>
          <p className="text-sm font-bold text-white mt-1 truncate">{pathData?.goal || 'Full-Stack Developer'}</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Assessed Proficiency</span>
          <p className="text-sm font-bold text-brand-400 mt-1 capitalize">{pathData?.currentSkillLevel || 'intermediate'}</p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Curriculum Progress</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-slate-800 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full"
                style={{ width: `${pathData?.progress || 0}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-white">{pathData?.progress || 0}%</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Time Remaining</span>
          <p className="text-sm font-bold text-white mt-1">{pathData?.estimatedHoursRemaining || 0} hrs estimated</p>
        </div>
      </div>

      {/* Step Milestones */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.id || idx}
            className={`glass-panel p-5 rounded-2xl border transition-all ${
              step.status === 'in_progress'
                ? 'border-brand-500/50 shadow-lg shadow-brand-500/10'
                : step.isCompleted
                ? 'border-slate-800 opacity-80'
                : 'border-slate-800/80'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : step.status === 'in_progress'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{step.title}</h3>
                    {step.isStruggleArea && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                        <ShieldAlert className="w-3 h-3" />
                        Targeted Struggle Intervention
                      </span>
                    )}
                    {step.matchesContext && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-medium">
                        {currentContext}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{step.duration}m</span>
                  </div>
                  <span className="capitalize text-slate-500">{step.difficulty}</span>
                </div>

                <Link
                  to={`/content/${step.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    step.status === 'in_progress'
                      ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>{step.isCompleted ? 'Review' : 'Open'}</span>
                  <Play className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Explanation Reason */}
            {step.reasons && step.reasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>{step.reasons[0]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
