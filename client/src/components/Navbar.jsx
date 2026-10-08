import React from 'react';
import { Menu, Sparkles, Bell } from 'lucide-react';
import ContextSwitcher from './ContextSwitcher';
import { usePersonalization } from '../context/PersonalizationContext';

export default function Navbar({ onMenuToggle }) {
  const { lastNotification, clearNotification } = usePersonalization();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <span className="text-xs font-medium text-slate-400">
              "Adapts to what you need right now"
            </span>
          </div>
        </div>

        {/* Center: Real-time context mode switcher (Requirement 13) */}
        <div className="flex-1 max-w-xl hidden md:flex justify-center">
          <ContextSwitcher />
        </div>

        {/* Right: Notification pill */}
        <div className="flex items-center gap-2">
          {lastNotification && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="truncate max-w-xs">{lastNotification}</span>
              <button
                onClick={clearNotification}
                className="text-emerald-400 hover:text-white ml-1 text-xs"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile context switcher bar */}
      <div className="mt-2.5 md:hidden">
        <ContextSwitcher />
      </div>
    </header>
  );
}
