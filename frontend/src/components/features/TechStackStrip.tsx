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
    <section className="py-10 border-t border-[#1c1f2e] bg-[#08090d] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 justify-between">
          <div className="text-xs sm:text-sm text-zinc-200 font-semibold whitespace-nowrap flex items-center gap-2">
            <SparkleIcon className="w-4 h-4 text-indigo-400" weight="fill" />
            <span>Built for students and engineers across every discipline:</span>
          </div>

          {/* Clean flex wrap pill badges */}
          <div className="flex flex-wrap items-center gap-2">
            {SUBJECT_PILLS.map((sub) => (
              <div
                key={sub.label}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0e1017] border border-[#1c1f2e] hover:border-[#282c40] rounded-xl text-xs transition-all cursor-default"
              >
                <span className="text-zinc-200 font-medium">{sub.label}</span>
                <span className="text-xs font-mono text-indigo-300 bg-[#141622] px-2 py-0.5 rounded-md border border-indigo-500/20">
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
