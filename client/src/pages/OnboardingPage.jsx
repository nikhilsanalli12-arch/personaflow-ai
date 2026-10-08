import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { Target, Award, Clock, BookOpen, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshPersona } = usePersonalization();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Become a full-stack developer');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [learningStyle, setLearningStyle] = useState('hands-on');
  const [selectedInterests, setSelectedInterests] = useState(['React', 'Node.js', 'APIs']);
  const [availableTime, setAvailableTime] = useState(30);
  const [currentPriority, setCurrentPriority] = useState('Build and ship full-stack web applications');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTopics = [
    'React', 'Node.js', 'APIs', 'PostgreSQL', 'JavaScript',
    'JWT & Security', 'Docker', 'System Design', 'DevOps'
  ];

  const toggleInterest = (topic) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter(t => t !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await api.put('/profile', {
        goal,
        skillLevel,
        learningStyle,
        interests: selectedInterests,
        availableTime: parseInt(availableTime, 10),
        currentPriority,
        preferences: {
          practicalProjects: learningStyle === 'hands-on',
          visualAids: learningStyle === 'visual'
        }
      });
      await refreshPersona();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step {step} of 3 — Tailoring Your Personal Experience</span>
        </div>
        <h2 className="text-2xl font-black text-white">Let's Initialize Your Adaptive Model</h2>
        <p className="text-xs text-slate-400 mt-1">
          These explicit inputs start at 100% confidence ("You told us"). PersonaFlow will evolve as you interact.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Primary Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master Full-Stack Web Development"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Assessed Skill Baseline
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { level: 'beginner', label: 'Beginner', desc: 'Starting out or early fundamentals' },
                  { level: 'intermediate', label: 'Intermediate', desc: 'Built several apps, learning deeper concepts' },
                  { level: 'advanced', label: 'Advanced', desc: 'Professional experience, tackling architecture' },
                  { level: 'expert', label: 'Expert', desc: 'Staff engineer or systems architect' }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setSkillLevel(item.level)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      skillLevel === item.level
                        ? 'bg-brand-500/10 border-brand-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold capitalize">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Core Topic Interests (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => {
                  const isSelected = selectedInterests.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleInterest(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-400 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Learning Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { style: 'hands-on', label: 'Hands-on', desc: 'Code exercises & projects' },
                  { style: 'visual', label: 'Visual', desc: 'Diagrams & system architectures' },
                  { style: 'reading', label: 'Deep Reading', desc: 'In-depth technical guides' }
                ].map((item) => (
                  <button
                    key={item.style}
                    type="button"
                    onClick={() => setLearningStyle(item.style)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      learningStyle === item.style
                        ? 'bg-brand-500/10 border-brand-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Average Daily Focus Time Available (Minutes)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[10, 30, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setAvailableTime(mins)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      availableTime === mins
                        ? 'bg-brand-500/10 border-brand-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-mono">{mins}m</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {mins === 10 ? 'Quick Task' : mins === 30 ? 'Focused' : mins === 60 ? 'Deep Dive' : 'Projects'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Immediate Milestone Priority
              </label>
              <input
                type="text"
                value={currentPriority}
                onChange={(e) => setCurrentPriority(e.target.value)}
                placeholder="e.g. Build and deploy a secure Node/React app"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2"
              >
                <span>{isSubmitting ? 'Calibrating Engine...' : 'Complete & Launch Experience'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
