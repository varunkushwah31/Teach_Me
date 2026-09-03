import React from 'react';
import { SparkleIcon } from '@phosphor-icons/react';

const SUBJECT_PILLS = [
  { label: 'Biology & Medicine', tag: 'MCAT / USMLE' },
  { label: 'Computer Science', tag: 'Algorithms & Systems' },
  { label: 'Chemistry & Physics', tag: 'Reactions & Proofs' },
  { label: 'Law & Precedents', tag: 'Case Briefs' },
  { label: 'Economics & Math', tag: 'Calculus & Stats' },
  { label: '100% Private Local Ollama', tag: 'Zero Data Leak' },
  { label: 'Custom Bring-Your-Own API Keys', tag: 'OpenAI / Claude / Gemini' }
];

export const TechStackStrip: React.FC = () => {
  return (
    <section className="py-10 border-t border-[#2e3238] bg-[#1c1e21] font-['Inter']">
      <div className="max-w-310 mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 justify-between">
          <div className="text-[14px] text-[#f3f4f6] font-semibold whitespace-nowrap flex items-center gap-2">
            <SparkleIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
            <span>Built for students across every discipline & model:</span>
          </div>

          {/* Clean flex wrap pill badges */}
          <div className="flex flex-wrap items-center gap-2">
            {SUBJECT_PILLS.map((sub) => (
              <div
                key={sub.label}
                className="flex items-center gap-2 px-3 py-1 bg-[#121317] border border-[#2e3238] hover:border-[#424750] rounded-full text-[12.5px] transition-all cursor-default card-hover-lift"
              >
                <span className="text-[#f3f4f6] font-medium">{sub.label}</span>
                <span className="text-[11px] font-mono text-[#a8ff53] bg-[#1c1e21] px-2 py-0.5 rounded border border-[#2e3238]">
                  {sub.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

