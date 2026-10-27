import React from 'react';
import { ArrowRightIcon, TerminalWindowIcon } from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

export const LandingNavbar: React.FC = () => {
  const { setViewMode, setActiveTab } = usePlayground();

  const handleLaunchApp = (tab: 'playground' | 'templates' | 'knowledge' | 'settings' = 'playground') => {
    setActiveTab(tab);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08090d]/85 backdrop-blur-xl border-b border-[#1c1f2e] transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group bg-transparent border-0 p-0 text-left"
          type="button"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30 group-hover:ring-indigo-400/60 transition-all duration-300" />
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
            <span>Fox.ai</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
              v2.4
            </span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
          <a
            href="#features"
            className="hover:text-indigo-300 transition-colors"
          >
            Features
          </a>
          <a
            href="#interactive-demo"
            className="hover:text-indigo-300 transition-colors"
          >
            Playground Demo
          </a>
          <a
            href="#architecture"
            className="hover:text-indigo-300 transition-colors"
          >
            Architecture
          </a>
          <a
            href="#benchmarks"
            className="hover:text-indigo-300 transition-colors"
          >
            Benchmarks
          </a>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLaunchApp('templates')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#141624] transition-colors cursor-pointer"
          >
            <span>Templates</span>
          </button>

          <button
            onClick={() => handleLaunchApp('playground')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-indigo-400/30 transition-all cursor-pointer active:scale-95 group"
          >
            <TerminalWindowIcon className="w-3.5 h-3.5" weight="bold" />
            <span>Launch Studio</span>
            <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
};
