import React from 'react';
import { HeartIcon } from '@phosphor-icons/react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 border-t border-[#272a2e] bg-[#1c1e21] text-center">
      <div className="max-w-300 mx-auto px-4 sm:px-6">
        
        {/* Heart Glow Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#121317] border border-[#272a2e] flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <HeartIcon className="w-5 h-5 text-[#f43f5e]" weight="fill" />
          </div>
        </div>

        {/* Social Proof Quote */}
        <p className="font-['Geist'] text-[18px] text-[#e5e7eb] max-w-135 mx-auto mb-14 leading-normal">
          We transparently build TeachMe in the open. Loved by students, researchers, and engineers everywhere.
        </p>

        {/* 3 Metric Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-200 mx-auto pt-6 border-t border-[#272a2e]">
          <div>
            <div className="font-['Satoshi'] font-semibold text-[44px] text-[#e5e7eb] mb-1">
              15M+
            </div>
            <div className="font-['Geist_Mono'] text-[13px] text-[#878c99]">
              Chunks Vectorized
            </div>
          </div>

          <div>
            <div className="font-['Satoshi'] font-semibold text-[44px] text-[#a8ff53] mb-1">
              Apache 2.0
            </div>
            <div className="font-['Geist_Mono'] text-[13px] text-[#878c99]">
              Open Source License
            </div>
          </div>

          <div>
            <div className="font-['Satoshi'] font-semibold text-[44px] text-[#9c9af2] mb-1">
              &lt; 50ms
            </div>
            <div className="font-['Geist_Mono'] text-[13px] text-[#878c99]">
              PgVector Search Latency
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
