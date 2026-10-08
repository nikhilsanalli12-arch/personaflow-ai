import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { HelpCircle, CheckCircle2, XCircle, ShieldAlert, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export default function QuizPage() {
  const { refreshPersona } = usePersonalization();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [attemptResult, setAttemptResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setIsLoading(true);
        const res = await api.get('/quiz');
        if (res.data?.success) {
          setQuizzes(res.data.data.quizzes || []);
          if (res.data.data.quizzes?.length > 0) {
            setActiveQuiz(res.data.data.quizzes[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions || [];
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : 0
    }));

    setIsSubmitting(true);
    try {
      const res = await api.post('/quiz/attempt', {
        quizId: activeQuiz.id,
        answers: formattedAnswers
      });
      if (res.data?.success) {
        setAttemptResult(res.data.data);
        await refreshPersona();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setAttemptResult(null);
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading quiz challenges...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-amber-400" />
          Technical Assessment & Skill Check
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Requirement 44 & 45: High scores signal skill mastery. Low scores detect struggle areas to dynamically prioritize practice.
        </p>
      </div>

      {/* Quiz Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {quizzes.map((q) => (
          <button
            key={q.id}
            onClick={() => {
              setActiveQuiz(q);
              handleResetQuiz();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeQuiz?.id === q.id
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {q.title} ({q.difficulty})
          </button>
        ))}
      </div>

      {/* Active Quiz Card */}
      {activeQuiz && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{activeQuiz.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Topic: <strong className="text-brand-300">{activeQuiz.topic}</strong> • Level: <span className="capitalize">{activeQuiz.difficulty}</span>
              </p>
            </div>
            {attemptResult && (
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1.5 text-xs text-brand-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>

          {/* Results Summary Box */}
          {attemptResult && (
            <div
              className={`p-5 rounded-2xl border ${
                attemptResult.score >= 70
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {attemptResult.score >= 70 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">
                    {attemptResult.score >= 70 ? 'Skill Demonstrated!' : 'Struggle Area Identified'}
                  </h4>
                </div>
                <span className="text-base font-mono font-extrabold text-white">
                  Score: {attemptResult.score}%
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {attemptResult.score >= 85
                  ? `Strong mastery recorded on ${attemptResult.topic}. Persona updated with positive skill advancement.`
                  : attemptResult.score >= 70
                  ? `Solid performance on ${attemptResult.topic}. Reinforcement recommendations unlocked.`
                  : `Score under 50% on ${attemptResult.topic}. PersonaFlow dynamically added "${attemptResult.topic}" as an active struggle area to prioritize reinforcement modules.`}
              </p>

              {attemptResult.personaImpact?.updated && (
                <div className="text-[11px] font-mono text-brand-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  ⚡ Persona State Evolved: Version incremented, audit event logged.
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {(attemptResult ? attemptResult.evaluatedQuestions : activeQuiz.questions || []).map((q, qIdx) => {
              const selectedOpt = selectedAnswers[q.id];

              return (
                <div key={q.id || qIdx} className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-white flex items-start gap-2">
                    <span className="text-brand-400 font-mono">Q{qIdx + 1}.</span>
                    <span>{q.question}</span>
                  </h4>

                  <div className="space-y-2 pl-4">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      let optionClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (attemptResult) {
                        if (optIdx === q.correctIndex) {
                          optionClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                        } else if (isSelected && !q.isCorrect) {
                          optionClass = 'bg-rose-500/20 border-rose-500 text-rose-300';
                        }
                      } else if (isSelected) {
                        optionClass = 'bg-brand-500/20 border-brand-500 text-white font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={!!attemptResult}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full p-2.5 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${optionClass}`}
                        >
                          <span>{opt}</span>
                          {attemptResult && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {attemptResult && isSelected && !q.isCorrect && (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {attemptResult && q.explanation && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!attemptResult && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
              >
                <span>{isSubmitting ? 'Evaluating Assessment...' : 'Submit Answers & Evolve Persona'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
