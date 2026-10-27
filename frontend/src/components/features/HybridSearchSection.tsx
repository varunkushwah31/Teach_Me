import React, { useState } from 'react';
import { MagnifyingGlassIcon, ArrowRightIcon } from '@phosphor-icons/react';
import type { SearchResultChunkDTO } from '@/types/backend.ts';

interface HybridSearchSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

const SAMPLE_RESULTS: Record<string, SearchResultChunkDTO[]> = {
  'SN2 nucleophilic substitution': [
    {
      chunkId: 'chunk-org-chem-14',
      documentId: 101,
      documentName: 'Organic_Chemistry_8th_Ed.pdf',
      cosineScore: 0.96,
      reRankScore: 0.98,
      text: 'In an SN2 mechanism, the nucleophile approaches the sp3 carbon 180° opposite the halogen leaving group, leading to complete inversion of configuration (Walden Inversion).'
    },
    {
      chunkId: 'chunk-org-chem-18',
      documentId: 101,
      documentName: 'Organic_Chemistry_8th_Ed.pdf',
      cosineScore: 0.89,
      reRankScore: 0.92,
      text: 'Steric hindrance strongly governs SN2 rates: Methyl > Primary (1°) > Secondary (2°) >>> Tertiary (3°, non-reactive due to crowding).'
    }
  ],
  'ATP Synthase proton gradient': [
    {
      chunkId: 'chunk-bio-48',
      documentId: 102,
      documentName: 'Cellular_Respiration_Ch4.pdf',
      cosineScore: 0.97,
      reRankScore: 0.99,
      text: 'The proton motive force generated across the inner mitochondrial membrane drives rotation of the c-ring subunit in ATP Synthase, synthesizing ATP from ADP + Pi.'
    },
    {
      chunkId: 'chunk-bio-52',
      documentId: 102,
      documentName: 'Cellular_Respiration_Ch4.pdf',
      cosineScore: 0.91,
      reRankScore: 0.94,
      text: 'Chemiosmosis couples electron transport through Complexes I-IV with proton translocation, maintaining a steep pH and electrical electrochemical gradient.'
    }
  ]
};

export const HybridSearchSection: React.FC<HybridSearchSectionProps> = ({ onOpenStudio }) => {
  const [query, setQuery] = useState('SN2 nucleophilic substitution');
  const [results, setResults] = useState<SearchResultChunkDTO[]>(
    SAMPLE_RESULTS['SN2 nucleophilic substitution']
  );

  const handleSelectQuery = (q: string) => {
    setQuery(q);
    setResults(SAMPLE_RESULTS[q] || SAMPLE_RESULTS['SN2 nucleophilic substitution']);
  };

  return (
    <section id="search" className="py-24 border-t border-[#1c1f2e] bg-[#08090d] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
              Instant Concept Search Across All Course Materials
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-[65ch] leading-relaxed">
              TeachMe combines PostgreSQL PgVector cosine similarity with full-text search, instantly locating exact formulas, chemical mechanisms, and legal precedents in milliseconds.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('search')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mt-4 md:mt-0"
          >
            <span>Search in Studio</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>
        </div>

        {/* Search Interactive Window */}
        <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-3xl p-6 shadow-2xl space-y-6">
          
          {/* Query Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all uploaded textbook chunks..."
                className="w-full bg-[#141622] border border-[#1c1f2e] rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-400 focus:border-indigo-500/70 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Quick Subject Query Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-zinc-400">Sample study queries:</span>
            {['SN2 nucleophilic substitution', 'ATP Synthase proton gradient'].map((q) => (
              <button
                key={q}
                onClick={() => handleSelectQuery(q)}
                className={`px-3 py-1.5 rounded-xl border font-mono transition-colors cursor-pointer text-xs ${
                  query === q
                    ? 'bg-indigo-950/80 text-indigo-200 font-semibold border-indigo-500/50 shadow-xs'
                    : 'bg-[#141622] border-[#1c1f2e] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((res) => (
              <div
                key={res.chunkId}
                className="p-5 bg-[#141622] border border-[#1c1f2e] rounded-2xl space-y-3 hover:border-indigo-500/40 transition-colors shadow-xs animate-slide-up"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{res.documentName}</span>
                    <span className="text-zinc-400">• Chunk {res.chunkId}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-indigo-300 bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      Cosine: {(res.cosineScore * 100).toFixed(1)}%
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                      Re-Rank: {(res.reRankScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 font-sans">
                  &ldquo;{res.text}&rdquo;
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
