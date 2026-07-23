import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Search, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { searchApi } from '../../lib/apiClient';

interface Props {
  chatId: string;
  onClose: () => void;
}

export const BatchSearchModal: React.FC<Props> = ({ chatId, onClose }) => {
  const [queriesInput, setQueriesInput] = useState(
    'Explain Heisenberg uncertainty principle\nWhat is the Schrödinger wave equation?\nHow is RRF fusion calculated?'
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string[]> | null>(null);

  const handleBatchSearch = async () => {
    const queries = queriesInput
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean);

    if (queries.length === 0) return;

    setLoading(true);
    try {
      const data = await searchApi.batchSearch(chatId, queries);
      setResults(data);
    } catch (err) {
      console.error('Batch search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-2xl w-full p-6 space-y-6 relative border-[#06B6D4]/40 shadow-2xl bg-[#0D0D17]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Batch Search Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 text-[#06B6D4] cyan-glow">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Batch Search & RRF Re-Ranking Engine</span>
              <Badge variant="cyan">Multi-Query Vector Search</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA]">Execute parallel vector searches across multiple queries simultaneously with semantic RRF scoring.</p>
          </div>
        </div>

        {/* Query Textarea */}
        <div className="space-y-2">
          <label htmlFor="batch-queries-input" className="block text-xs font-mono uppercase font-semibold text-[#A1A1AA]">
            Enter Parallel Search Queries (One Per Line)
          </label>
          <textarea
            id="batch-queries-input"
            rows={4}
            value={queriesInput}
            onChange={(e) => setQueriesInput(e.target.value)}
            placeholder="Type search queries on separate lines..."
            className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#06B6D4] font-mono leading-relaxed"
          />
        </div>

        {/* Results Area */}
        {results && (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs font-mono font-semibold text-white uppercase">Re-Ranked Top Vector Chunks:</p>
            {Object.entries(results).map(([query, chunks]: [string, string[]]) => (
              <div key={query} className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#06B6D4] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    Query: "{query}"
                  </span>
                  <Badge variant="outline">{(chunks || []).length} chunks</Badge>
                </div>
                <div className="space-y-1 pl-3 border-l-2 border-[#06B6D4]/40">
                  {(chunks || []).map((chunk: string, idx: number) => (
                    <p key={idx} className="text-[11px] text-[#A1A1AA] font-mono leading-relaxed italic">
                      "{chunk}"
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-3 border-t border-[#27272A]">
          <span className="text-[10px] text-[#A1A1AA] font-mono">Consumes Spring AI Hybrid Search & RRF Re-Ranking Service</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleBatchSearch}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white text-xs font-bold rounded-xl cyan-glow flex items-center gap-2 disabled:opacity-40"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Searching & Scoring...' : 'Run Batch Re-Rank'}</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
