import React from 'react';
import { Sparkles } from 'lucide-react';

const SUBJECT_PILLS = [
  { label: 'Biology & Medicine', tag: 'MCAT / USMLE' },
  { label: 'Computer Science', tag: 'Algorithms / Systems' },
  { label: 'Chemistry & Physics', tag: 'Formulas & Reactions' },
  { label: 'Law & Precedents', tag: 'Case Briefs' },
  { label: 'Economics & Math', tag: 'Proofs & Calculus' },
  { label: '100% Private Local Ollama', tag: 'Offline' },
  { label: 'Custom API Keys', tag: 'OpenAI / Claude' }
];

export const TechStackStrip: React.FC = () => {
  return (
    <section className="py-12 border-t border-[#272a2e] bg-[#1c1e21] font-['Geist']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 justify-between">
          <div className="text-[14px] text-[#b5b8c0] font-medium whitespace-nowrap flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a8ff53]" />
            <span>Built for students across any discipline & model:</span>
          </div>

          {/* Clean flex wrap pill badges */}
          <div className="flex flex-wrap items-center gap-2">
            {SUBJECT_PILLS.map((sub, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-[#121317] border border-[#272a2e] hover:border-[#3b3e45] rounded-full text-[12.5px] transition-colors cursor-default"
              >
                <span className="text-[#e5e7eb] font-medium">{sub.label}</span>
                <span className="text-[10.5px] font-['Geist_Mono'] text-[#a8ff53] bg-[#1c1e21] px-1.5 py-0.2 rounded">
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
