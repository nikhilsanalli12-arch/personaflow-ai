import React, { useState } from 'react';
import api from '../services/api';
import { usePersonalization } from '../context/PersonalizationContext';
import { Bot, Send, Sparkles, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AssistantPage() {
  const { currentContext, persona } = usePersonalization();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your PersonaFlow AI Co-Pilot. I'm calibrated to your active goal ("${persona?.goal || 'Full-Stack Development'}"), your ${persona?.skillLevel || 'intermediate'} skill baseline, and your active "${currentContext}" context. How can I assist you right now?`,
      personalizationUsed: [
        `Goal: ${persona?.goal || 'Full-Stack Development'}`,
        `Context: ${currentContext}`,
        `Skill: ${persona?.skillLevel || 'intermediate'}`
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: messageText });
      if (res.data?.success) {
        const { message, suggestedActions, personalizationUsed, confidence } = res.data.data;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: message,
            suggestedActions,
            personalizationUsed,
            confidence
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I encountered an error processing your inquiry. Please try again.',
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How should I prepare for a full-stack interview?',
    'Help me understand Authorization with Middleware step-by-step',
    'What should I build next in Building Project mode?'
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              PersonaFlow Contextual Co-Pilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Gemini API
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Adapting responses using your active persona & {currentContext} mode
            </p>
          </div>
        </div>

        {/* Provenance pill */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Skill: <strong className="text-white capitalize">{persona?.skillLevel}</strong></span>
          <span>•</span>
          <span>Mode: <strong className="text-white">{currentContext}</strong></span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-2">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {/* Personalization Used Tags (Requirement 50, Contract L) */}
              {msg.personalizationUsed && msg.personalizationUsed.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 px-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Personalization:</span>
                  {msg.personalizationUsed.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(`Tell me more about: ${act}`)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-brand-300 border border-slate-800 hover:border-brand-500/40 transition-colors"
                    >
                      &rarr; {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>Analyzing context and synthesizing personalized guidance...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Strip */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-500">Suggested:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors truncate max-w-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask co-pilot in ${currentContext} mode...`}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
