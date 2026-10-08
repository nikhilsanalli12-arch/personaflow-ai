import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';

export default function ContentDetailPage() {
  const { id } = useParams();
  const { refreshPersona } = usePersonalization();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setIsLoading(true);
        const res = await api.get(`/content/${id}`);
        if (res.data?.success) {
          setContent(res.data.data.content);

          // Log view_content interaction event (Requirement 10)
          await api.post('/interactions', {
            eventType: 'view_content',
            contentId: id,
            metadata: { title: res.data.data.content.title }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleComplete = async () => {
    try {
      await api.post('/interactions', {
        eventType: 'complete_content',
        contentId: id,
        metadata: { title: content?.title, topic: content?.topic }
      });
      setIsCompleted(true);
      await refreshPersona();
      setToast('Module marked as completed! Persona updated with completion signals.');
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedback = async (type) => {
    try {
      await api.post(`/recommendations/${id}/feedback`, { feedback: type });
      setFeedbackSent(type);
      await refreshPersona();
      setToast(`Feedback "${type}" logged and incorporated into personalization.`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading module content...</div>;
  if (!content) return <div className="p-12 text-center text-slate-500">Module not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}>&times;</button>
        </div>
      )}

      {/* Back button */}
      <Link
        to="/content"
        className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </Link>

      {/* Header card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {content.category}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium capitalize">
              {content.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{content.duration} minutes</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{content.title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed">{content.description}</p>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {content.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Simulated Interactive Learning Content */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Module Instructions & Code Walkthrough</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hands-on implementation steps and core conceptual architecture.
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4 leading-relaxed">
          <p>
            When architecting modern applications in <strong>{content.topic}</strong>, isolating responsibilities between transport, business rules, and state persistence is essential for enterprise security and resilience.
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            <code>
              {`// Example pattern for ${content.title}
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};`}
            </code>
          </div>

          <p>
            Review the ordering of your middleware. Authentication must always precede authorization guards, ensuring claims are verified before permission checks execute.
          </p>
        </div>

        {/* Interaction Action Buttons (Requirement 10 & 120) */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              disabled={isCompleted}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
            </button>

            <Link
              to="/quiz"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Test Understanding in Quiz</span>
            </Link>
          </div>

          {/* Feedback buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">How was this module?</span>
            <button
              onClick={() => handleFeedback('useful')}
              className={`p-2 rounded-xl border transition-colors ${
                feedbackSent === 'useful'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Helpful"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('too_difficult')}
              className={`p-2 rounded-xl border transition-colors ${
                feedbackSent === 'too_difficult'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Too Difficult (Feeds struggle area detection)"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
