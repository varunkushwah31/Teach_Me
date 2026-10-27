import React from 'react';
import { DatabaseIcon, CpuIcon, LightningIcon, HardDrivesIcon, ShieldCheckIcon } from '@phosphor-icons/react';

export const TechStackMarquee: React.FC = () => {
  const techs = [
    { name: 'Neon Lakebase Postgres', category: 'Branchable SQL Database', icon: DatabaseIcon },
    { name: 'Spring Boot 3.3', category: 'Enterprise Java Engine', icon: HardDrivesIcon },
    { name: 'PgVector Cosine Search', category: 'Vector Embeddings', icon: LightningIcon },
    { name: 'OpenAI GPT-4', category: 'Flagship LLM', icon: CpuIcon },
    { name: 'Claude 3.5 Sonnet', category: 'Anthropic Reasoning', icon: CpuIcon },
    { name: 'DeepSeek-R1 Ollama', category: 'Open-Weights Cluster', icon: CpuIcon },
    { name: 'Gemini 2.0 Flash', category: 'Sub-second Multimodal', icon: CpuIcon },
    { name: 'Groq LPU Engine', category: 'Ultra-low Latency', icon: LightningIcon },
    { name: 'React 19 & Tailwind 4', category: 'Modern Frontend', icon: ShieldCheckIcon }
  ];

  return (
    <section className="py-12 border-y border-[#1c1f2e] bg-[#090a10] select-none overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 text-center mb-6">
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
          Engineered on Industry-Grade Architecture
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 px-4 max-w-6xl mx-auto">
        {techs.map((tech) => {
          const Icon = tech.icon;
          return (
            <div
              key={tech.name}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 transition-colors shadow-xs"
            >
              <div className="w-5 h-5 rounded-lg bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Icon className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-zinc-200">{tech.name}</div>
                <div className="text-xs text-zinc-400 font-mono">{tech.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
