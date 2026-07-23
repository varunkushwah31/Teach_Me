import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, BarChart3, Clock, BookOpen, Layers, Tag } from 'lucide-react';

interface Props {
  documentId: number;
  documentName: string;
  onClose: () => void;
}

export const DocumentAnalyticsModal: React.FC<Props> = ({ documentId, documentName, onClose }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8081/api/documents/${documentId}/analytics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('teachme_jwt_token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load document analytics', err);
        setLoading(false);
      });
  }, [documentId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-12 text-center text-xs text-[#A1A1AA] font-mono animate-pulse">
          Analyzing text density, syllables & vector store chunks...
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="py-8 text-center text-xs text-[#EF4444]">
          Failed to retrieve document analytics.
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#F97316]" />
            <div>
              <p className="text-[10px] text-[#A1A1AA] font-mono uppercase">Total Words</p>
              <p className="text-sm font-bold text-white">{analytics.totalWords?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#06B6D4]" />
            <div>
              <p className="text-[10px] text-[#A1A1AA] font-mono uppercase">Est. Read Time</p>
              <p className="text-sm font-bold text-white">{analytics.estimatedReadingTimeMinutes || 1} min(s)</p>
            </div>
          </div>

          <div className="p-3.5 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#F97316]" />
            <div>
              <p className="text-[10px] text-[#A1A1AA] font-mono uppercase">PgVector Chunks</p>
              <p className="text-sm font-bold text-white">{analytics.chunkCount || 0}</p>
            </div>
          </div>

          <div className="p-3.5 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center gap-3">
            <Tag className="w-5 h-5 text-[#06B6D4]" />
            <div>
              <p className="text-[10px] text-[#A1A1AA] font-mono uppercase">Flesch-Kincaid Level</p>
              <p className="text-xs font-bold text-[#06B6D4]">{analytics.readabilityGradeLevel || 'Academic'}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-white mb-2">Top Extracted Academic Terms:</p>
          <div className="flex flex-wrap gap-1.5">
            {analytics.topExtractedKeywords?.map((kw: string) => (
              <Badge key={kw} variant="orange">
                #{kw}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-xl w-full p-6 space-y-6 relative border-[#F97316]/30">
        <button
          onClick={onClose}
          aria-label="Close Analytics Modal"
          className="absolute top-4 right-4 p-1 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <div className="p-2.5 rounded-xl bg-[#F97316]/10 text-[#F97316] orange-glow">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Document Readability & Analytics</h2>
            <p className="text-xs text-[#A1A1AA] font-mono">{documentName}</p>
          </div>
        </div>

        {renderContent()}
      </Card>
    </div>
  );
};
