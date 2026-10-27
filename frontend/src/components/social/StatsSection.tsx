import React from 'react';
import { HeartIcon } from '@phosphor-icons/react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 border-t border-[#1c1f2e] bg-[#08090d] text-center font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Heart Icon with Physical Shadow */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] flex items-center justify-center shadow-lg">
            <HeartIcon className="w-5 h-5 text-rose-500" weight="fill" />
          </div>
        </div>

        {/* Social Proof Quote */}
        <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto mb-14 leading-relaxed">
          We transparently build TeachMe in the open. Loved by students, researchers, and engineers everywhere.
        </p>

        {/* 3 Telemetry Readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-[#1c1f2e]">
          <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1c1f2e]">
            <div className="font-mono font-bold tracking-tight text-3xl sm:text-4xl text-white mb-1 tabular-nums">
              15M+
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Chunks Vectorized
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1c1f2e]">
            <div className="font-mono font-bold tracking-tight text-3xl sm:text-4xl text-indigo-400 mb-1">
              Apache 2.0
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Open Source License
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1017] border border-[#1c1f2e]">
            <div className="font-mono font-bold tracking-tight text-3xl sm:text-4xl text-emerald-400 mb-1 tabular-nums">
              &lt; 50ms
            </div>
            <div className="font-mono text-xs text-zinc-400">
              PgVector Search Latency
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
