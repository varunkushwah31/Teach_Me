import React from 'react';

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
    avatarColor: '#a8ff53'
  },
  {
    quote:
      'The SM-2 Spaced Repetition engine and auto-quiz generator allowed us to launch our adaptive test-prep platform in 2 weeks. The step-level retry saved us countless hours of debugging.',
    author: 'Marcus Vance',
    role: 'CTO & Co-Founder',
    company: 'StudyWave',
    avatarColor: '#9c9af2'
  },
  {
    quote:
      'Having Spring Boot on the backend with PgVector and full TypeScript SDK support is the developer experience we have been waiting for. The streaming chat and Map-Reduce summaries are flawless.',
    author: 'Elena Rostova',
    role: 'Head of Infrastructure',
    company: 'QuantumEd',
    avatarColor: '#fa3abf'
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 border-t border-[#272a2e] bg-[#1c1e21]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 text-center">
          <h2 className="font-['Satoshi'] font-semibold text-[32px] sm:text-[38px] text-[#e5e7eb] mb-3">
            Loved by developers
          </h2>
          <p className="font-['Geist'] text-[16px] text-[#878c99] max-w-[600px] mx-auto leading-[1.5]">
            Engineers and educators around the world rely on TeachMe for mission-critical learning intelligence.
          </p>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#1c1e21] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200"
            >
              <div>
                {/* Quote Text */}
                <p className="font-['Geist'] font-normal text-[15px] sm:text-[16px] leading-[1.56] text-[#e5e7eb] mb-6">
                  "{t.quote}"
                </p>
              </div>

              {/* Author & Story Link */}
              <div className="pt-4 border-t border-[#272a2e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-['Geist_Mono'] text-[12px] font-bold text-[#121317]"
                    style={{ backgroundColor: t.avatarColor }}
                  >
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-['Geist'] font-medium text-[14px] text-[#d7d9dd]">
                      {t.author}
                    </div>
                    <div className="font-['Geist'] text-[12px] text-[#878c99]">
                      {t.role} • {t.company}
                    </div>
                  </div>
                </div>

                <a
                  href="#testimonials"
                  className="flex items-center gap-1 text-[13px] font-['Geist'] text-[#878c99] hover:text-[#e5e7eb] transition-colors"
                >
                  <span>Read story</span>
                  <span className="text-[#fa3abf]">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
