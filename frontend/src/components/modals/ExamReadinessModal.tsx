import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Award, CheckCircle2, AlertCircle, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { readinessApi } from '../../lib/apiClient';

interface Props {
  documentId: number;
  documentName: string;
  onClose: () => void;
}

export const ExamReadinessModal: React.FC<Props> = ({ documentId, documentName, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readinessApi.calculate(documentId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [documentId]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-lg w-full p-6 space-y-6 relative border-[#10B981]/40 shadow-2xl bg-[#0D0D17]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Exam Readiness Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#06B6D4]/20 text-[#10B981] cyan-glow">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Exam Readiness Predictor</span>
              <Badge variant="cyan">90%+ Grade Target</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono truncate max-w-xs mt-0.5">{documentName}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#10B981] font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Analyzing quiz scores & flashcard recall rates...</span>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs">
            {/* Big Readiness Score Ring Card */}
            <div className="p-5 rounded-2xl bg-[#06060A] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase">Preparedness Score</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white">{data?.readinessScore}%</span>
                  <Badge variant="success">{data?.status}</Badge>
                </div>
                <p className="text-[11px] text-[#10B981] font-sans mt-1">Predicted Grade: {data?.estimatedGradePrediction}</p>
              </div>

              {/* Graphical Circular Meter Indicator */}
              <div className="w-16 h-16 rounded-full border-4 border-[#10B981] flex items-center justify-center font-bold text-white text-sm orange-glow">
                {data?.readinessScore}%
              </div>
            </div>

            {/* Breakdown Metrics */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[9px] text-[#94A3B8] uppercase">Quiz Accuracy</span>
                <p className="font-bold text-[#06B6D4]">{data?.quizAccuracy}%</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[9px] text-[#94A3B8] uppercase">Flashcard Recall</span>
                <p className="font-bold text-[#F97316]">{data?.flashcardMasteryRate}%</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[9px] text-[#94A3B8] uppercase">Chunk Coverage</span>
                <p className="font-bold text-[#10B981]">{data?.chunkCoveragePercent}%</p>
              </div>
            </div>

            {/* Targeted Recommendations */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Study Recommendations:</span>
              <div className="space-y-1.5">
                {data?.recommendations?.map((rec: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#06060A]/80 border border-white/5 flex items-start gap-2 text-xs text-[#94A3B8]">
                    <ChevronRight className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#27272A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-[#10B981] to-[#06B6D4] hover:opacity-95 text-white text-xs font-bold rounded-xl cyan-glow cursor-pointer"
          >
            Close Predictor
          </button>
        </div>
      </Card>
    </div>
  );
};
