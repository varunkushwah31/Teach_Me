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

  // Helper to compute slider background fill
  const getTrackFill = (val: number, min: number, max: number) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, #8b5cf6 0%, #a855f7 ${pct}%, #1e202d ${pct}%, #1e202d 100%)`;
  };

  const systemPresets = [
    { label: 'Technical Tutor', prompt: 'You are an intelligent, precise, and helpful AI assistant specialized in computer science, software engineering, and technical problem-solving.' },
    { label: 'Code Reviewer', prompt: 'You are a staff-level software architect. Review code strictly for correctness, performance bottlenecks, space-time complexity, and idiomatic maintainability.' },
    { label: 'Socratic Mentor', prompt: 'Act as a Socratic mentor. Guide the user through questions and deductive steps rather than giving direct answers immediately.' }
  ];

  return (
    <aside className="w-80 bg-[#0c0d12] border-l border-[#171822] flex flex-col h-full select-none overflow-y-auto relative z-20">
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#171822] flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-200">Model Parameters</span>
        </div>
        <button
          onClick={handleResetClick}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group px-2.5 py-1 rounded-lg hover:bg-zinc-800/60 cursor-pointer active:scale-95"
          title="Reset parameters to defaults"
        >
          <ArrowCounterClockwiseIcon
            className={`w-3.5 h-3.5 transition-transform duration-500 ${resetRotating ? '-rotate-180 text-purple-400' : 'group-hover:-rotate-45'}`}
          />
          <span className="font-medium text-[11px]">Reset</span>
        </button>
      </div>

      {/* Sliders Container */}
      <div className="p-5 space-y-6 flex-1 text-xs">
        {/* 1. Temperature */}
        <div className="space-y-2.5 p-3 rounded-xl bg-[#11121a] border border-[#1a1b28] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Temperature</span>
            <span className="bg-[#241a3a] text-[#c084fc] border border-purple-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold shadow-[0_0_8px_rgba(139,92,246,0.2)]">
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

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
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
                className={`flex-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                  Math.abs(parameters.temperature - p.val) < 0.05
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-xs'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed pt-1 border-t border-zinc-800/40">
            Controls randomness: Lower values lead to focused, factual responses. Higher values introduce creative variability.
          </p>
        </div>

        {/* 2. Max Tokens / Length */}
        <div className="space-y-2.5 p-3 rounded-xl bg-[#11121a] border border-[#1a1b28] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Max Length</span>
            <span className="bg-[#241a3a] text-[#c084fc] border border-purple-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold shadow-[0_0_8px_rgba(139,92,246,0.2)]">
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

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>64 tokens</span>
            <span>4,096 tokens</span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[1024, 2048, 4096].map(val => (
              <button
                key={val}
                onClick={() => updateParameters({ maxTokens: val })}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-medium transition-all cursor-pointer ${
                  parameters.maxTokens === val
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-xs'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed pt-1 border-t border-zinc-800/40">
            Maximum token budget allocated for completion generation.
          </p>
        </div>

        {/* 3. Top P */}
        <div className="space-y-2.5 p-3 rounded-xl bg-[#11121a] border border-[#1a1b28] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Top P</span>
            <span className="bg-[#241a3a] text-[#c084fc] border border-purple-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold">
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

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>0.0</span>
            <span>1.0</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Nucleus sampling: 0.5 considers tokens comprising the top 50% probability mass.
          </p>
        </div>

        {/* 4. Frequency & Presence Penalty */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 p-3 rounded-xl bg-[#11121a] border border-[#1a1b28]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-zinc-300">Freq. Penalty</span>
              <span className="font-mono text-purple-300 font-bold text-[11px]">
                {parameters.frequencyPenalty.toFixed(1)}
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
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-[#11121a] border border-[#1a1b28]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-zinc-300">Pres. Penalty</span>
              <span className="font-mono text-purple-300 font-bold text-[11px]">
                {parameters.presencePenalty.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={parameters.presencePenalty}
              onChange={e => updateParameters({ presencePenalty: parseFloat(e.target.value) })}
              style={{ background: getTrackFill(parameters.presencePenalty, 0, 2) }}
              className="w-full fox-slider cursor-pointer"
            />
          </div>
        </div>

        {/* 5. System Instructions */}
        <div className="space-y-2 p-3 rounded-xl bg-[#11121a] border border-[#1a1b28]">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <SparkleIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>System Role</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              {parameters.systemPrompt.length} chars
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1">
            {systemPresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => updateParameters({ systemPrompt: preset.prompt })}
                className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-purple-950/60 hover:text-purple-300 border border-zinc-700/60 text-[10px] text-zinc-300 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <textarea
            value={parameters.systemPrompt}
            onChange={e => updateParameters({ systemPrompt: e.target.value })}
            rows={4}
            className="w-full bg-[#161724] border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none leading-relaxed font-mono"
            placeholder="Instruct the model on its identity, style, and constraints..."
          />
        </div>
      </div>
    </aside>
  );
};
