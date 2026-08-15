import React from 'react';
import { Bot, Database, Sparkles, Layers, Volume2, Sliders } from 'lucide-react';

interface RuntimeCard {
  title: string;
  category: string;
  icon: React.ReactNode;
  iconColor: string;
  description: string;
}

const RUNTIME_CARDS: RuntimeCard[] = [
  {
    title: 'Local Ollama & GGUF Models',
    category: 'Private Inference',
    icon: <Sliders className="w-4 h-4" />,
    iconColor: '#a8ff53', // Signal Lime
    description: 'Run quantized Llama 3.3 and DeepSeek R1 locally on your workstation with zero cloud token costs and 100% data privacy.'
  },
  {
    title: 'Spring AI & PgVector Store',
    category: 'Vector Database',
    icon: <Database className="w-4 h-4" />,
    iconColor: '#e5e7eb', // Bone Text
    description: 'High-dimensional vector storage with PostgreSQL HNSW indexing, delivering sub-50ms cosine similarity queries.'
  },
  {
    title: 'SuperMemo-2 (SM-2) Memory',
    category: 'Cognitive Science',
    icon: <Layers className="w-4 h-4" />,
    iconColor: '#fa3abf', // Syntax Pink
    description: 'Adaptive spaced repetition algorithm that dynamically calculates Ease Factors and expands review intervals for long-term retention.'
  },
  {
    title: 'Bloom Cognitive Auto-Quiz',
    category: 'Assessment Engine',
    icon: <Bot className="w-4 h-4" />,
    iconColor: '#9c9af2', // Syntax Violet
    description: 'Generates 5-question multiple choice diagnostic tests from document vectors, complete with instant grading and chapter citations.'
  },
  {
    title: 'Distributed Map-Reduce Summaries',
    category: 'Synthesis Pipeline',
    icon: <Sparkles className="w-4 h-4" />,
    iconColor: '#afec73', // Loop Green
    description: 'Parallel MAP chunk analysis synthesized through REDUCE into executive 300-word briefs for 100+ page textbook PDFs.'
  },
  {
    title: '2-Speaker AI Podcast Generator',
    category: 'Audio Learning',
    icon: <Volume2 className="w-4 h-4" />,
    iconColor: '#d9f07c', // Key Lime
    description: 'Converts dense study material into engaging 2-host conversational dialogues (Alex & Maya) with simulated audio waveform playback.'
  }
];

export const RuntimeGridSection: React.FC = () => {
  return (
    <section className="py-24 border-t border-[#272a2e] bg-[#1c1e21]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 max-w-[700px]">
          <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-['Geist_Mono'] text-[13px] font-medium mb-3">
            <span>Built for Academic Mastery</span>
          </div>

          <h2 className="font-['Satoshi'] font-semibold text-[32px] sm:text-[40px] text-[#e5e7eb] mb-4">
            Six Autonomous AI Engines in One Platform
          </h2>

          <p className="font-['Geist'] text-[16px] text-[#878c99] leading-[1.56]">
            Every layer of TeachMe is designed for high-performance academic retrieval, permanent cognitive memory, and flexible study modalities.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RUNTIME_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="bg-[#121317] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
            >
              <div>
                {/* Header Row: Category Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] font-['Geist_Mono'] text-[#878c99] px-2 py-0.5 rounded bg-[#1c1e21] border border-[#272a2e]">
                    {card.category}
                  </span>
                  <div
                    className="w-7 h-7 rounded-[4px] bg-[#1c1e21] border border-[#272a2e] flex items-center justify-center transition-colors group-hover:border-[#3b3e45]"
                    style={{ color: card.iconColor }}
                  >
                    {card.icon}
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="font-['Satoshi'] font-semibold text-[18px] text-[#e5e7eb] mb-2 group-hover:text-[#a8ff53] transition-colors">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="font-['Geist'] text-[14px] leading-[1.6] text-[#878c99]">
                  {card.description}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-4 mt-4 border-t border-[#272a2e]/60 flex items-center justify-between text-[11px] font-['Geist_Mono'] text-[#878c99]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff53]" />
                  <span>Production Ready</span>
                </span>
                <span className="text-[#a8ff53] opacity-0 group-hover:opacity-100 transition-opacity">
                  Active →
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
