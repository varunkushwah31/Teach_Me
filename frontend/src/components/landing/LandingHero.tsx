import React, { useState, useEffect } from 'react';
import {
  ArrowRightIcon,
  TerminalWindowIcon,
  PlayIcon,
  CopyIcon,
  CheckIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

const HERO_PRESETS = [
  {
    title: 'Quantum Computing',
    prompt: 'Explain quantum superposition and how qubits achieve computational parallelism over classical bits.',
    response: `Quantum superposition allows a qubit to exist in a linear combination of states |0⟩ and |1⟩:\n\n|ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1.\n\nWhile N classical bits represent 1 discrete value out of 2ᴺ at any single instant, an entangled N-qubit system simultaneously spans all 2ᴺ state amplitudes. Upon measurement, the wave function collapses to a single definite eigenvalue with probability determined by Born's rule.`
  },
  {
    title: 'Database Sharding',
    prompt: 'Compare consistent hashing vs range-based partitioning for distributed PostgreSQL scaling.',
    response: `Consistent Hashing maps data keys and database nodes onto a 360° ring topology. Adding or removing a shard node only migrates K/N keys (where K is total keys and N is shard count), preventing full-cluster resharding overhead.\n\nRange Partitioning partitions rows by contiguous ranges (e.g., timestamps). While ideal for scan queries, it frequently suffers from "hot-spot" write bottlenecks on the newest partition node.`
  },
  {
    title: 'Algorithm Complexity',
    prompt: 'Analyze worst-case and amortized time complexity of dynamic array resizing and QuickSort.',
    response: `Dynamic Array Amortized Analysis:\n- Normal Append: O(1)\n- Array Doubling: O(N) copy penalty occurs every 2ᵏ steps\n- Aggregate Amortized Cost: Σ(cost)/N = (2N)/N = O(1) per insert.\n\nQuickSort Worst-Case:\n- Pathological pivot selection (e.g. sorted input with end pivot) yields O(N²) quadratic recursion depth.\n- Randomized pivot partition guarantees O(N log N) expected bound.`
  }
];

export const LandingHero: React.FC = () => {
  const { setViewMode, setActiveTab, runPrompt } = usePlayground();

  // Interactive Hero Playground State
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [simulatedText, setSimulatedText] = useState(HERO_PRESETS[0].response);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-stream response text when preset changes
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      const fullText = HERO_PRESETS[selectedPresetIdx].response;
      setSimulatedText('');
      setIsTyping(true);

      let idx = 0;
      interval = setInterval(() => {
        idx += 4;
        if (idx >= fullText.length) {
          setSimulatedText(fullText);
          setIsTyping(false);
          clearInterval(interval);
        } else {
          setSimulatedText(fullText.slice(0, idx));
        }
      }, 18);
    }, 10);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [selectedPresetIdx]);

  const handleCopy = () => {
    void navigator.clipboard.writeText(simulatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWithPrompt = (promptText: string) => {
    setActiveTab('playground');
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      void runPrompt(promptText);
    }, 200);
  };

  const launchButtonClass = "w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)] border border-indigo-400/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2.5 group";
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* Background Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-225 h-112.5 bg-linear-to-b from-indigo-950/25 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11131e] border border-[#23273c] shadow-xs animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-medium text-zinc-300">
            PgVector Hybrid RAG Engine v2.4
          </span>
          <ArrowRightIcon className="w-3 h-3 text-zinc-400" />
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          The Intelligent AI Studio & Knowledge Workspace.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Synthesize deep research, test prompt architectures with granular parameter control, and index course documents into high-performance vector memory.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => {
              setActiveTab('playground');
              setViewMode('app');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={launchButtonClass}
          >
            <TerminalWindowIcon className="w-4 h-4" weight="bold" />
            <span>Launch Studio</span>
            <span className="keycap text-xs bg-white/20 text-white border-white/30 ml-1">
              Ctrl+N
            </span>
          </button>

          <a
            href="#interactive-demo"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#11131d] hover:bg-[#181a28] border border-[#23263a] hover:border-zinc-700 text-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
          >
            <PlayIcon className="w-4 h-4 text-indigo-400" weight="fill" />
            <span>Try Interactive Demo</span>
          </a>
        </div>
      </div>

      {/* Interactive Live Hero Terminal Widget */}
      <div id="interactive-demo" className="max-w-4xl mx-auto mt-14 relative z-10 animate-slide-up">
        <div className="rounded-3xl border border-[#23253b] bg-linear-to-b from-[#12131f] via-[#0d0e17] to-[#0a0b12] shadow-[0_20px_70px_rgba(0,0,0,0.7)] overflow-hidden">
          {/* Mac-Style Window Title Bar */}
          <div className="h-12 px-4 bg-[#141524] border-b border-[#23253b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f87171]/80 border border-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#fbbf24]/80 border border-[#f59e0b]" />
              <div className="w-3 h-3 rounded-full bg-[#34d399]/80 border border-[#10b981]" />
              <span className="ml-3 text-xs font-mono text-zinc-400 font-medium hidden sm:inline">
                fox-playground ~ model: gpt-4 ~ temp: 0.7
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                128k context
              </span>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copy terminal completion"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive Preset Chips Header */}
          <div className="px-4 py-2.5 bg-[#0f111a] border-b border-[#1c1f30] flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
              Prompt Presets:
            </span>
            {HERO_PRESETS.map((preset, idx) => (
              <button
                key={preset.title}
                onClick={() => setSelectedPresetIdx(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedPresetIdx === idx
                    ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                    : 'bg-[#141624] text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Terminal Body */}
          <div className="p-5 sm:p-7 space-y-4 font-mono text-xs">
            {/* User Input Prompt */}
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Input Prompt:</span>
              </div>
              <div className="p-3 rounded-xl bg-[#121420] border border-[#202336] text-zinc-200 leading-relaxed font-sans text-xs">
                {HERO_PRESETS[selectedPresetIdx].prompt}
              </div>
            </div>

            {/* AI Streaming Response */}
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-zinc-300 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span>Completion Stream:</span>
                </span>
                <span className="text-zinc-400 font-mono text-xs tabular-nums">
                  {simulatedText.length} tokens streamed
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#090a10] border border-[#1a1b2c] text-zinc-300 leading-relaxed whitespace-pre-wrap min-h-35 relative font-mono text-xs">
                {simulatedText}
                {isTyping && (
                  <span className="inline-block w-2 h-3.5 bg-indigo-400 ml-1 animate-pulse" />
                )}
              </div>
            </div>

            {/* Terminal Action Bar */}
            <div className="pt-3 border-t border-[#1b1d2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 font-sans">
                Want to run this with your own parameters & documents?
              </div>
              <button
                onClick={() => handleLaunchWithPrompt(HERO_PRESETS[selectedPresetIdx].prompt)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#141624] hover:bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 hover:border-indigo-500 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>Open in Full Studio</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
