import React from 'react';
import { ArrowRightIcon, BookmarkSimpleIcon } from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

export const LandingCTA: React.FC = () => {
  const { setViewMode, setActiveTab } = usePlayground();

  const handleLaunchApp = (tab: 'playground' | 'templates' | 'knowledge' | 'settings' = 'playground') => {
    setActiveTab(tab);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
      {/* Glow Behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-indigo-950/30 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative rounded-3xl p-8 md:p-16 border border-[#1c1f2e] bg-[#0e1017] shadow-2xl text-center overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Stop waiting for slow responses. Experience true real-time AI.
          </h2>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Test prompt parameters in our synthesizer playground, connect external documents via PgVector, and benchmark token latency in seconds.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleLaunchApp('playground')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_16px_rgba(0,0,0,0.6)] border border-indigo-400/30 transition-all duration-200 active:scale-[0.98] flex items-center gap-2.5 cursor-pointer group"
            >
              <span>Launch Studio Now</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
            </button>

            <button
              onClick={() => handleLaunchApp('templates')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-300 hover:text-white bg-[#141624] hover:bg-[#1a1c2e] border border-[#23263a] hover:border-indigo-500/40 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <BookmarkSimpleIcon className="w-4 h-4 text-indigo-400" />
              <span>Explore Blueprints</span>
            </button>
          </div>

          {/* Tech Badges */}
          <div className="pt-6 border-t border-[#1c1f2e] flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Neon Serverless Postgres</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Spring AI MCP Orchestrator</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>1536-dim PgVector HNSW</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Zero Emojis Standard</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
