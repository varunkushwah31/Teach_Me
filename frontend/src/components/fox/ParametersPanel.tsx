import React, { useState } from 'react';
import {
  ArrowCounterClockwiseIcon,
  SlidersHorizontalIcon,
  SparkleIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

export const ParametersPanel: React.FC = () => {
  const { parameters, updateParameters, resetParameters } = usePlayground();
  const [resetRotating, setResetRotating] = useState(false);

  const handleResetClick = () => {
    setResetRotating(true);
    resetParameters();
    setTimeout(() => setResetRotating(false), 500);
  };

  // Helper to compute slider background fill with Electric Indigo
  const getTrackFill = (val: number, min: number, max: number) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, #6366f1 0%, #4f46e5 ${pct}%, #1c1f2e ${pct}%, #1c1f2e 100%)`;
  };

  const systemPresets = [
    { label: 'Technical Tutor', prompt: 'You are an intelligent, precise, and helpful AI assistant specialized in computer science, software engineering, and technical problem-solving.' },
    { label: 'Code Reviewer', prompt: 'You are a staff-level software architect. Review code strictly for correctness, performance bottlenecks, space-time complexity, and idiomatic maintainability.' },
    { label: 'Socratic Mentor', prompt: 'Act as a Socratic mentor. Guide the user through questions and deductive steps rather than giving direct answers immediately.' }
  ];

  return (
    <aside className="w-80 bg-[#0a0b10] border-l border-[#171822] flex flex-col h-full select-none overflow-y-auto relative z-20">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#171822] flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-200">Model Parameters</span>
        </div>
        <button
          onClick={handleResetClick}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group px-2.5 py-1 rounded-lg hover:bg-zinc-800/60 cursor-pointer active:scale-95"
          title="Reset parameters to defaults"
        >
          <ArrowCounterClockwiseIcon
            className={`w-3.5 h-3.5 transition-transform duration-500 ${resetRotating ? '-rotate-180 text-indigo-400' : 'group-hover:-rotate-45'}`}
          />
          <span className="font-medium text-xs">Reset</span>
        </button>
      </div>

      {/* Sliders Container */}
      <div className="p-5 space-y-6 flex-1 text-xs">
        {/* 1. Temperature */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0e1017] border border-[#1c1f2e] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Temperature</span>
            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold">
              {parameters.temperature.toFixed(1)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={parameters.temperature}
            onChange={e => updateParameters({ temperature: parseFloat(e.target.value) })}
            style={{ background: getTrackFill(parameters.temperature, 0, 2) }}
            className="w-full fox-slider cursor-pointer"
          />

          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>0.0 (Deterministic)</span>
            <span>2.0 (Creative)</span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[
              { val: 0.2, label: 'Precise' },
              { val: 0.7, label: 'Balanced' },
              { val: 1.2, label: 'Creative' }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => updateParameters({ temperature: p.val })}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  Math.abs(parameters.temperature - p.val) < 0.05
                    ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                    : 'bg-[#141624] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d30] border border-[#202336]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-[#1a1b28]">
            Lower values generate deterministic, factual responses. Higher values permit exploratory synthesis.
          </p>
        </div>

        {/* 2. Max Tokens / Length */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0e1017] border border-[#1c1f2e] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Max Length</span>
            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold">
              {parameters.maxTokens}
            </span>
          </div>

          <input
            type="range"
            min="64"
            max="4096"
            step="64"
            value={parameters.maxTokens}
            onChange={e => updateParameters({ maxTokens: parseInt(e.target.value, 10) })}
            style={{ background: getTrackFill(parameters.maxTokens, 64, 4096) }}
            className="w-full fox-slider cursor-pointer"
          />

          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>64 tokens</span>
            <span>4,096 tokens</span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[
              { val: 512, label: 'Short' },
              { val: 2048, label: 'Standard' },
              { val: 4096, label: 'Max' }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => updateParameters({ maxTokens: p.val })}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  parameters.maxTokens === p.val
                    ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                    : 'bg-[#141624] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d30] border border-[#202336]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-[#1a1b28]">
            Upper bound limit on generated completion tokens per inference call.
          </p>
        </div>

        {/* 3. Top P (Nucleus Sampling) */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0e1017] border border-[#1c1f2e] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Top P</span>
            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold">
              {parameters.topP.toFixed(2)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={parameters.topP}
            onChange={e => updateParameters({ topP: parseFloat(e.target.value) })}
            style={{ background: getTrackFill(parameters.topP, 0, 1) }}
            className="w-full fox-slider cursor-pointer"
          />

          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>0.0 (Narrow)</span>
            <span>1.0 (Broad)</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-[#1a1b28]">
            Nucleus sampling cutoff: 0.1 considers only top 10% probability mass.
          </p>
        </div>

        {/* 4. Frequency Penalty */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0e1017] border border-[#1c1f2e] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Frequency Penalty</span>
            <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold">
              {parameters.frequencyPenalty.toFixed(2)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={parameters.frequencyPenalty}
            onChange={e => updateParameters({ frequencyPenalty: parseFloat(e.target.value) })}
            style={{ background: getTrackFill(parameters.frequencyPenalty, 0, 2) }}
            className="w-full fox-slider cursor-pointer"
          />

          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span>0.0 (None)</span>
            <span>2.0 (Strict)</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-[#1a1b28]">
            Penalizes new tokens based on existing frequency in generated text to suppress repetition.
          </p>
        </div>

        {/* 5. System Presets */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <SparkleIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>System Persona Presets</span>
          </div>

          <div className="space-y-2">
            {systemPresets.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => updateParameters({ systemPrompt: sp.prompt })}
                className="w-full text-left p-3 rounded-xl bg-[#0e1017] hover:bg-[#141624] border border-[#1c1f2e] hover:border-indigo-500/40 transition-all cursor-pointer group"
              >
                <div className="font-bold text-zinc-200 group-hover:text-white text-xs">
                  {sp.label}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {sp.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
