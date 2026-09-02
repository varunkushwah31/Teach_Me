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
    <section id="search" className="py-24 border-t border-[#272a2e] bg-[#1c1e21] font-['Geist']">
      <div className="max-w-300 mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-['Geist_Mono'] text-[13px] font-medium mb-3">
              <DatabaseIcon className="w-3.5 h-3.5" />
              <span>Sub-50ms PgVector Semantic Retrieval</span>
            </div>
            <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[38px] text-[#e5e7eb] mb-3">
              Instant Concept Search Across All Course Materials
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#878c99] max-w-155 leading-[1.58]">
              TeachMe indexes your textbooks in PgVector with HNSW cosine distance search, instantly locating exact formulas, case precedents, and diagrams in milliseconds.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('search')}
            className="group inline-flex items-center gap-1.5 text-[14px] text-[#a8ff53] hover:underline cursor-pointer mt-4 md:mt-0"
          >
            <span>Search in Studio</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Search Interactive Window */}
        <div className="bg-[#121317] border border-[#272a2e] rounded-sm p-6 shadow-2xl space-y-6">
          
          {/* Query Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#878c99] absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all uploaded textbook chunks..."
                className="w-full bg-[#1c1e21] border border-[#272a2e] rounded-sm pl-9 pr-4 py-2 text-[14px] text-[#e5e7eb] focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Subject Query Pills */}
          <div className="flex items-center gap-2 flex-wrap text-[12px]">
            <span className="text-[#878c99]">Sample study questions:</span>
            {['SN2 nucleophilic substitution', 'ATP Synthase proton gradient'].map((q) => (
              <button
                key={q}
                onClick={() => handleSelectQuery(q)}
                className={`px-2.5 py-1 rounded-sm border font-['Geist_Mono'] transition-colors cursor-pointer ${
                  query === q
                    ? 'bg-[#a8ff53] text-[#121317] font-semibold border-[#a8ff53]'
                    : 'bg-[#1c1e21] border-[#272a2e] text-[#d7d9dd] hover:border-[#3b3e45]'
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
                className="p-4 bg-[#1c1e21] border border-[#272a2e] rounded-sm space-y-2 hover:border-[#3b3e45] transition-colors"
              >
                <div className="flex items-center justify-between text-[12px] font-['Geist_Mono']">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a8ff53] font-semibold">{res.documentName}</span>
                    <span className="text-[#878c99]">Chunk {res.chunkId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#9c9af2]">Cosine: {(res.cosineScore * 100).toFixed(1)}%</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#121317] text-[#afec73]">
                      Re-Rank: {(res.reRankScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-[13.5px] leading-[1.62] text-[#d7d9dd]">
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
