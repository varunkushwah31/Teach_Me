import React from 'react';
import { usePlayground } from '../../context/usePlayground';

export const LandingFooter: React.FC = () => {
  const { setViewMode, setActiveTab } = usePlayground();

  const handleNavigate = (tab: 'playground' | 'templates' | 'knowledge' | 'settings') => {
    setActiveTab(tab);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#171822] bg-[#07080c] text-zinc-400 select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                <span>Fox.ai</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                  v2.4
                </span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Next-generation AI Prompt Studio and Knowledge Engine built with Neon Serverless Postgres, PgVector semantic indexing, and Spring AI MCP reactive pipelines.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-zinc-400">
                All Systems Operational • ep-fragrant-band-34155063
              </span>
            </div>
          </div>

          {/* Column 1: Studio */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Studio Suite
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNavigate('playground')}
                  className="text-zinc-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Interactive Playground
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('templates')}
                  className="text-zinc-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Prompt Blueprints
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('knowledge')}
                  className="text-zinc-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  PgVector RAG Knowledge
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('settings')}
                  className="text-zinc-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  API Keys &amp; Parameters
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Architecture */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Stack &amp; Engine
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a href="#architecture" className="hover:text-indigo-300 transition-colors">
                  Neon Serverless Postgres
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-indigo-300 transition-colors">
                  Spring AI 1.0 MCP Tools
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-indigo-300 transition-colors">
                  1536-dim PgVector HNSW
                </a>
              </li>
              <li>
                <a href="#benchmarks" className="hover:text-indigo-300 transition-colors">
                  SSE Token Stream Reader
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Models */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Supported Models
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>OpenAI GPT-4o &amp; mini</li>
              <li>Anthropic Claude 3.5 Sonnet</li>
              <li>Google Gemini 2.0 Flash</li>
              <li>DeepSeek-R1 Reasoner</li>
              <li>Mistral Large 2</li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-14 pt-8 border-t border-[#1c1f2e] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div>
            &copy; {new Date().getFullYear()} Fox.ai Studio • TeachMe AI. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Strict Zero-Emoji Codebase Standard</span>
            <span>Sub-50ms TTFT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
