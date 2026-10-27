import React from 'react';
import { XIcon, CheckCircleIcon, CpuIcon, LightningIcon } from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ isOpen, onClose }) => {
  const { selectedModelOption, parameters } = usePlayground();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-[#12131e] to-[#0d0e16] border border-[#1f2133] rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b1d2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-sm">
              <CpuIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedModelOption.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-normal">
                  {selectedModelOption.provider}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Architecture and runtime profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-5 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#151624] border border-[#222438] text-zinc-300 leading-relaxed">
            {selectedModelOption.description}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#151624] border border-[#222438]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                Context Window
              </span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <LightningIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>{selectedModelOption.contextWindow}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#151624] border border-[#222438]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                Active Temp
              </span>
              <span className="text-sm font-bold text-purple-300 font-mono">
                {parameters.temperature.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Runtime Features
            </div>
            <div className="space-y-2 text-zinc-300">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141522] border border-[#1c1e30]">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Real-time Server-Sent Events (SSE) token streaming</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141522] border border-[#1c1e30]">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>PgVector cosine distance similarity retrieval</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141522] border border-[#1c1e30]">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Structured markdown with isolated code execution sandbox</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-5 mt-5 border-t border-[#1b1d2e] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#171826] hover:bg-[#202236] text-zinc-200 border border-zinc-700/80 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
