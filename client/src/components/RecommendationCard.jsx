import React, { useState } from 'react';
import { Sparkles, Clock, BarChart2, ThumbsUp, ThumbsDown, Bookmark, ExternalLink, X, Eye } from 'lucide-react';
import WhyAmISeeingThisModal from './WhyAmISeeingThisModal';

export default function RecommendationCard({
  item,
  onFeedback,
  onOpen,
  onDismiss,
  onSave
}) {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showFeedbackPicker, setShowFeedbackPicker] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(item.feedback || null);
  const [isSaved, setIsSaved] = useState(false);

  const handleFeedbackClick = (type) => {
    setFeedbackSubmitted(type);
    setShowFeedbackPicker(false);
    if (onFeedback) {
      onFeedback(item.contentId, type);
    }
  };

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave(item.contentId, !isSaved);
  };

  const difficultyColors = {
    beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    intermediate: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    advanced: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    expert: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <>
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between border border-slate-800 relative group">
        {/* Top Badges & Score */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  difficultyColors[item.difficulty] || difficultyColors.beginner
                }`}
              >
                {item.difficulty}
              </span>
              <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {item.duration}m
              </span>
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                {item.contentType?.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{item.score}%</span>
              </div>
              <button
                onClick={() => onDismiss && onDismiss(item.contentId)}
                title="Dismiss recommendation"
                className="p-1 text-slate-500 hover:text-slate-300 rounded-md hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Explainability Snippet (Requirement 23 & Contract H) */}
          {item.reasons && item.reasons.length > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 line-clamp-2">
                {item.reasons[0]}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls & Why Trigger */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* Why am I seeing this trigger button */}
          <button
            onClick={() => setShowWhyModal(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-brand-400 hover:text-brand-300 hover:underline transition-all"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Why am I seeing this?
          </button>

          {/* Interaction buttons */}
          <div className="flex items-center gap-1">
            {/* Feedback buttons */}
            <div className="relative">
              <button
                onClick={() => handleFeedbackClick('useful')}
                title="Mark Useful"
                className={`p-1.5 rounded-lg border transition-all ${
                  feedbackSubmitted === 'useful'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-emerald-400'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFeedbackPicker(!showFeedbackPicker)}
                title="Mark Not Useful / Tune recommendation"
                className={`p-1.5 rounded-lg border transition-all ${
                  feedbackSubmitted && feedbackSubmitted !== 'useful'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-amber-400'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {/* Feedback reason flyout menu */}
              {showFeedbackPicker && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-20 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">
                    Feedback Reason
                  </div>
                  {[
                    { key: 'too_easy', label: 'Too Easy' },
                    { key: 'too_difficult', label: 'Too Difficult' },
                    { key: 'already_know_this', label: 'Already Know This' },
                    { key: 'too_long', label: 'Too Long' },
                    { key: 'not_practical', label: 'Not Practical' },
                    { key: 'not_useful', label: 'Wrong Context' }
                  ].map((fb) => (
                    <button
                      key={fb.key}
                      onClick={() => handleFeedbackClick(fb.key)}
                      className="w-full text-left px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {fb.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveClick}
              title="Bookmark"
              className={`p-1.5 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-purple-400'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpen && onOpen(item.contentId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all ml-1"
            >
              <span>Open</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Explanations Modal */}
      <WhyAmISeeingThisModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        data={item.whyAmISeeingThis}
      />
    </>
  );
}

function ArrowUpRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
  );
}
