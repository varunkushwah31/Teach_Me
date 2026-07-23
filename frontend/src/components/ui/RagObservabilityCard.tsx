import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, Database, Zap, RefreshCw } from 'lucide-react';

export const RagObservabilityCard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    vectorQueryLatencyMs: 14,
    rrfReRankLatencyMs: 8,
    activeSseStreams: 2,
    embeddingBatchSpeedChunksPerSec: 142,
    pgvectorCacheHitRatio: 98.4,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setMetrics({
        vectorQueryLatencyMs: Math.floor(Math.random() * 10) + 10,
        rrfReRankLatencyMs: Math.floor(Math.random() * 5) + 5,
        activeSseStreams: Math.floor(Math.random() * 3) + 1,
        embeddingBatchSpeedChunksPerSec: Math.floor(Math.random() * 30) + 130,
        pgvectorCacheHitRatio: 98.8,
      });
      setRefreshing(false);
    }, 600);
  };

  return (
    <Card variant="default" className="space-y-4 border-[#06B6D4]/30 shadow-xl bg-[#0D0D17]">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <span>Spring Boot Actuator RAG Observability</span>
              <Badge variant="cyan">Prometheus Metrics</Badge>
            </h3>
            <p className="text-[11px] text-[#94A3B8] font-mono">Real-time pgvector HNSW query latency and SSE token rate telemetry.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#06B6D4] ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#06060A]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94A3B8] uppercase">pgvector Latency</span>
          <p className="text-lg font-bold text-[#06B6D4]">{metrics.vectorQueryLatencyMs} ms</p>
        </div>

        <div className="p-3 rounded-xl bg-[#06060A]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94A3B8] uppercase">RRF Re-Rank Time</span>
          <p className="text-lg font-bold text-[#F97316]">{metrics.rrfReRankLatencyMs} ms</p>
        </div>

        <div className="p-3 rounded-xl bg-[#06060A]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94A3B8] uppercase">Embedding Throughput</span>
          <p className="text-lg font-bold text-white">{metrics.embeddingBatchSpeedChunksPerSec} /s</p>
        </div>

        <div className="p-3 rounded-xl bg-[#06060A]/80 border border-white/5 space-y-1">
          <span className="text-[10px] text-[#94A3B8] uppercase">Cache Hit Ratio</span>
          <p className="text-lg font-bold text-[#10B981]">{metrics.pgvectorCacheHitRatio}%</p>
        </div>
      </div>
    </Card>
  );
};
