import React, { useState } from 'react';
import {
  DatabaseIcon,
  SlidersHorizontalIcon,
  BookmarkSimpleIcon,
  StackIcon,
  ArrowRightIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

export const BentoFeatures: React.FC = () => {
  const { setViewMode, setActiveTab } = usePlayground();

  // Interactive slider inside Bento Card 2
  const [bentoTemp, setBentoTemp] = useState(0.7);

  const handleLaunch = (tab: 'playground' | 'templates' | 'knowledge' | 'settings') => {
    setActiveTab(tab);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 select-none relative bg-[#08090d]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered for Precision & Depth.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Every module is tailored for high-signal synthesis, mathematical precision, and rapid knowledge retrieval.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1 (Span 2 cols): PgVector Hybrid RAG Engine */}
          <div className="md:col-span-2 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DatabaseIcon className="w-5 h-5 text-indigo-400 shrink-0" weight="duotone" />
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">
                  PgVector Hybrid Retrieval-Augmented Generation
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Upload PDFs, textbooks, and course lecture notes. Fox.ai extracts semantic chunks and indexes them into PostgreSQL with cosine distance vector indexes for verified context answers.
              </p>
            </div>

            {/* Flat Semantic Retrieval Strip (No Nested Card) */}
            <div className="mt-6 pt-5 border-t border-[#1c1f2e] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between font-bold text-zinc-400">
                <span>Retrieved Context Chunks</span>
                <span className="text-emerald-400">PgVector Active</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-zinc-200 truncate">
                      CS106B_Lecture_Algorithms_Complexity.pdf
                    </div>
                    <div className="text-zinc-400 truncate text-xs">
                      "T(n) = 2T(n/2) + O(n) resolves to O(n log n) by Master Theorem..."
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold shrink-0 tabular-nums">
                    98.4% Match
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-zinc-200 truncate">
                      Operating_Systems_Concurrency.pdf
                    </div>
                    <div className="text-zinc-400 truncate text-xs">
                      "Mutex ownership prevents race conditions across thread scheduling..."
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-xs font-bold shrink-0 tabular-nums">
                    93.7% Match
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
              <span className="text-xs text-zinc-400">Verifiable source page citations</span>
              <button
                onClick={() => handleLaunch('knowledge')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer group/btn"
              >
                <span>Explore Document System</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bento Card 2: Interactive Parameter Control */}
          <div className="rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <SlidersHorizontalIcon className="w-5 h-5 text-indigo-400 shrink-0" weight="duotone" />
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                  Studio Precision Controls
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fine-tune Temperature, Top P nucleus sampling, and Frequency Penalties in real time.
              </p>
            </div>

            {/* Flat Live Parameter Control (No Nested Card) */}
            <div className="mt-6 pt-5 border-t border-[#1c1f2e] space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 text-xs">Temperature</span>
                <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-xs font-bold tabular-nums">
                  {bentoTemp.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={bentoTemp}
                onChange={e => setBentoTemp(Number.parseFloat(e.target.value))}
                className="w-full fox-slider cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Deterministic (0.0)</span>
                <span>Creative (2.0)</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
              <span className="text-xs text-zinc-400">Real-time tone shaping</span>
              <button
                onClick={() => handleLaunch('playground')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer group/btn"
              >
                <span>Open Sliders</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bento Card 3: Prompt Blueprint Templates */}
          <div className="rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookmarkSimpleIcon className="w-5 h-5 text-indigo-400 shrink-0" weight="duotone" />
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                  Prompt Blueprint Library
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Save, search, and reuse complex prompt templates across sessions with single-click execution.
              </p>
            </div>

            {/* Flat Blueprint Rows (No Nested Card) */}
            <div className="mt-6 pt-5 border-t border-[#1c1f2e] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-zinc-200">Explain Like I'm Five</div>
                  <div className="text-zinc-400 text-xs">Simple relatable analogies</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-[#141624] text-zinc-300 border border-[#202336]">
                  Education
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-zinc-200">Code Performance Review</div>
                  <div className="text-zinc-400 text-xs">Big-O &amp; security audit</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-[#141624] text-zinc-300 border border-[#202336]">
                  Engineering
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
              <span className="text-xs text-zinc-400">Custom prompt repository</span>
              <button
                onClick={() => handleLaunch('templates')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer group/btn"
              >
                <span>View Library</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bento Card 4 (Span 2 cols): AI Learning Lab */}
          <div className="md:col-span-2 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StackIcon className="w-5 h-5 text-indigo-400 shrink-0" weight="duotone" />
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">
                  Autonomous Study Laboratory
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                Transform passive course reading into active recall: instantly synthesize multiple-choice quizzes with explanations, 3D SM-2 flashcard decks, and executive lecture briefs.
              </p>
            </div>

            {/* Flat Feature Trio Row (No Nested Card) */}
            <div className="mt-6 pt-5 border-t border-[#1c1f2e] grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-300">Auto-Quiz Engine</div>
                <div className="text-xs text-zinc-400 leading-relaxed">Real-time difficulty scoring & review explanations</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-300">SM-2 Spaced Recall</div>
                <div className="text-xs text-zinc-400 leading-relaxed">Algorithmic flashcard intervals & ease factor</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-300">Cornell Outlines</div>
                <div className="text-xs text-zinc-400 leading-relaxed">Structured markdown study guides & summaries</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
              <span className="text-xs text-zinc-400">Active recall mastery</span>
              <button
                onClick={() => handleLaunch('knowledge')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer group/btn"
              >
                <span>Launch Study Tools</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
