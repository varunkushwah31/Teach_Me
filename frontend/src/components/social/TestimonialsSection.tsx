import React from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'TeachMe replaced our fragile custom scripts with rock-solid Spring AI workflows. Processing 200-page medical textbooks used to crash our lambdas — now they finish in under 3 seconds with full vector citations.',
    author: 'Dr. Sarah Lin',
    role: 'Lead ML Engineer',
    company: 'BioLearn AI',
    avatarColor: '#6366f1'
  },
  {
    quote:
      'The SM-2 Spaced Repetition engine and auto-quiz generator allowed us to launch our adaptive test-prep platform in 2 weeks. The step-level retry saved us countless hours of debugging.',
    author: 'Marcus Vance',
    role: 'CTO & Co-Founder',
    company: 'StudyWave',
    avatarColor: '#818cf8'
  },
  {
    quote:
      'Having Spring Boot on the backend with PgVector and full TypeScript SDK support is the developer experience we have been waiting for. The streaming chat and Map-Reduce summaries are flawless.',
    author: 'Elena Rostova',
    role: 'Head of Infrastructure',
    company: 'QuantumEd',
    avatarColor: '#10b981'
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 border-t border-[#1c1f2e] bg-[#08090d] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 text-center">
          <h2 className="font-extrabold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
            Loved by developers &amp; researchers
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Engineers and educators around the world rely on TeachMe for mission-critical learning intelligence.
          </p>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="bg-[#0e1017] border border-[#1c1f2e] hover:border-[#282c40] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200 shadow-xs"
            >
              <div>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-200 mb-6 font-sans">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author & Story Link */}
              <div className="pt-4 border-t border-[#1c1f2e] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold text-white"
                    style={{ backgroundColor: t.avatarColor }}
                  >
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-xs text-white">
                      {t.author}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {t.role} • {t.company}
                    </div>
                  </div>
                </div>

                <a
                  href="#testimonials"
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Read story</span>
                  <ArrowRightIcon className="w-3 h-3 text-indigo-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
