import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Network, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { knowledgeGraphApi } from '../../lib/apiClient';

interface Props {
  documentId: number;
  documentName: string;
  onClose: () => void;
}

export const KnowledgeGraphModal: React.FC<Props> = ({ documentId, documentName, onClose }) => {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    knowledgeGraphApi.get(documentId).then((res) => {
      setGraphData(res);
      setLoading(false);
    });
  }, [documentId]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-3xl w-full p-6 space-y-6 relative border-[#06B6D4]/40 shadow-2xl bg-[#0D0D17] max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Knowledge Graph Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A] shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 text-[#06B6D4] cyan-glow">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Academic Concept Knowledge Graph</span>
              <Badge variant="cyan">AI Entity Relationship Matrix</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono truncate max-w-md mt-0.5">{documentName}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#06B6D4] font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Extracting concept entities and links...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 font-mono text-xs">
            {/* Concept Nodes Matrix */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">Key Concept Nodes ({graphData?.nodeCount || 0})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {graphData?.nodes?.map((node: any) => (
                  <div key={node.id} className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">{node.label}</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">{node.category}</p>
                    </div>
                    <Badge variant={node.importance === 'HIGH' ? 'orange' : 'outline'}>{node.importance}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationship Edge Links */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">Directional Relationship Edges ({graphData?.edgeCount || 0})</p>
              <div className="space-y-2">
                {graphData?.edges?.map((edge: any, idx: number) => {
                  const sourceNode = graphData?.nodes?.find((n: any) => n.id === edge.source);
                  const targetNode = graphData?.nodes?.find((n: any) => n.id === edge.target);

                  return (
                    <div key={idx} className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F97316]">{sourceNode?.label || edge.source}</span>
                      <span className="text-[10px] text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-1 rounded-md border border-[#06B6D4]/20 flex items-center gap-1">
                        {edge.relation} <ArrowRight className="w-3 h-3" />
                      </span>
                      <span className="font-bold text-white">{targetNode?.label || edge.target}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#27272A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white text-xs font-bold rounded-xl cyan-glow cursor-pointer"
          >
            Close Knowledge Graph
          </button>
        </div>
      </Card>
    </div>
  );
};
