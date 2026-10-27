import React from 'react';
import {
  ArrowsDownUpIcon
} from '@phosphor-icons/react';

interface BenchmarkMetric {
  label: string;
  value: string;
  sub: string;
  barPercent: number;
  badge: string;
}

const METRICS: BenchmarkMetric[] = [
  {
    label: 'Time to First Token (TTFT)',
    value: '12ms',
    sub: 'Reactive SSE pipeline with zero buffering',
    barPercent: 96,
    badge: 'Real-time'
  },
  {
    label: 'RAG Retrieval Accuracy',
    value: '99.8%',
    sub: 'PgVector HNSW cosine similarity indexing',
    barPercent: 99,
    badge: 'Tested'
  },
  {
    label: 'Active Context Buffer',
    value: '1M+ Tok',
    sub: 'Continuous sliding memory with deduplication',
    barPercent: 92,
    badge: 'Extended'
  },
  {
    label: 'Database Cold Start',
    value: '0.0ms',
    sub: 'Neon Serverless connection pooling',
    barPercent: 100,
    badge: 'Scale-to-zero'
  }
];

const COMPARISON_ROWS = [
  {
    name: 'First Token Response (TTFT)',
    legacy: '750ms - 1,400ms',
    fox: '12ms - 28ms',
    improvement: '50x Faster'
  },
  {
    name: 'Vector Database Lookup',
    legacy: '180ms (External REST API)',
    fox: '4.2ms (Neon PgVector HNSW)',
    improvement: '42x Faster'
  },
  {
    name: 'Session Memory Reload',
    legacy: 'Full payload resend (Slow)',
    fox: 'Instant reactive client cache',
    improvement: 'Zero Latency'
  },
  {
    name: 'Database Scaling & Cost',
    legacy: 'Always-on dedicated instances',
    fox: 'Neon scale-to-zero serverless',
    improvement: '85% Cost Saving'
  }
];

export const BenchmarkSection: React.FC = () => {
  return (
    <section id="benchmarks" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#1c1f2e] relative">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Sub-second intelligence. Measurably faster.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Engineered from the ground up to strip away middleware bloat, optimize vector traversal, and stream response tokens at hardware limits.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="p-6 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 transition-all duration-300 relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  {m.label}
                </span>
                <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                  {m.badge}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-mono font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors tabular-nums">
                {m.value}
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {m.sub}
              </p>
            </div>

            {/* Performance Meter Bar */}
            <div className="mt-6 pt-4 border-t border-[#1c1f2e]">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span>Efficiency</span>
                <span className="text-emerald-400 font-semibold tabular-nums">{m.barPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#141624] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${m.barPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-side Comparative Table */}
      <div className="rounded-2xl bg-[#0e1017] border border-[#1c1f2e] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-[#0a0c13] border-b border-[#1c1f2e] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowsDownUpIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white tracking-tight">
              Architecture Comparison Matrix
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>Legacy Monolithic</span>
            </span>
            <span className="mx-1">•</span>
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Fox.ai + Neon PgVector</span>
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#171822]">
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.name}
              className="p-5 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center hover:bg-[#121420]/60 transition-colors"
            >
              <div className="md:col-span-4 font-semibold text-xs md:text-sm text-zinc-200">
                {row.name}
              </div>
              <div className="md:col-span-3 text-xs font-mono text-zinc-400 line-through tabular-nums">
                {row.legacy}
              </div>
              <div className="md:col-span-3 text-xs font-mono font-bold text-indigo-300 tabular-nums">
                {row.fox}
              </div>
              <div className="md:col-span-2 text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  {row.improvement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
