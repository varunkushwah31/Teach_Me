import React, { useState } from 'react';
import { MagnifyingGlassIcon, DatabaseIcon, ArrowRightIcon } from '@phosphor-icons/react';
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
    <section id="search" className="py-24 border-t border-[#2e3238] bg-[#1c1e21] font-['Inter']">
      <div className="max-w-310 mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-mono text-[13px] font-semibold mb-3">
              <DatabaseIcon className="w-4 h-4" />
              <span>Sub-50ms PgVector Retrieval</span>
            </div>
            <h2 className="font-bold text-[32px] sm:text-[40px] text-[#f3f4f6] mb-3 tracking-tight">
              Instant Concept Search Across All Course Materials
            </h2>
            <p className="text-[16px] text-[#b5b8c0] max-w-160 leading-[1.6]">
              TeachMe combines PostgreSQL PgVector cosine similarity with full-text search, instantly locating exact formulas, chemical mechanisms, and legal precedents in milliseconds.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('search')}
            className="group inline-flex items-center gap-2 text-[14px] text-[#a8ff53] font-semibold hover:underline cursor-pointer mt-4 md:mt-0"
          >
            <span>Search in Studio</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>
        </div>

        {/* Search Interactive Window */}
        <div className="bg-[#121317] border border-[#2e3238] rounded p-6 shadow-2xl space-y-6">
          
          {/* Query Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#a0a4af] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all uploaded textbook chunks..."
                className="w-full bg-[#1c1e21] border border-[#2e3238] rounded pl-10 pr-4 py-2.5 text-[14px] text-[#f3f4f6] focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Subject Query Pills */}
          <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
            <span className="text-[#a0a4af]">Sample study queries:</span>
            {['SN2 nucleophilic substitution', 'ATP Synthase proton gradient'].map((q) => (
              <button
                key={q}
                onClick={() => handleSelectQuery(q)}
                className={`px-3 py-1.5 rounded border font-mono transition-colors cursor-pointer text-[12px] card-hover-lift ${
                  query === q
                    ? 'bg-[#a8ff53] text-[#121317] font-semibold border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.2)]'
                    : 'bg-[#1c1e21] border-[#2e3238] text-[#d7d9dd] hover:border-[#424750]'
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
                className="p-4 bg-[#1c1e21] border border-[#2e3238] rounded space-y-2.5 hover:border-[#424750] transition-colors shadow-lg animate-slide-up"
              >
                <div className="flex items-center justify-between text-[12px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a8ff53] font-semibold">{res.documentName}</span>
                    <span className="text-[#a0a4af]">Chunk {res.chunkId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#9c9af2] bg-[#9c9af2]/10 px-2 py-0.5 rounded border border-[#9c9af2]/20">
                      Cosine: {(res.cosineScore * 100).toFixed(1)}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#a8ff53]/10 text-[#a8ff53] border border-[#a8ff53]/20">
                      Re-Rank: {(res.reRankScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-[14px] leading-[1.65] text-[#e5e7eb]">
                  "{res.text}"
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

