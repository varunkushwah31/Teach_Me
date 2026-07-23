import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Sparkles, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { studyPlanApi } from '../../lib/apiClient';

interface Props {
  documentId: number;
  documentName: string;
  onClose: () => void;
}

export const StudyRoadmapModal: React.FC<Props> = ({ documentId, documentName, onClose }) => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studyPlanApi.generate(documentId, 3).then((res) => {
      setPlan(res);
      setLoading(false);
    });
  }, [documentId]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-2xl w-full p-6 space-y-6 relative border-[#F97316]/40 shadow-2xl bg-[#0D0D17] max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Study Roadmap Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A] shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#D946EF]/20 text-[#F97316] orange-glow">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Day-by-Day Study Roadmap</span>
              <Badge variant="orange">Automated Syllabus</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono truncate max-w-md mt-0.5">{documentName}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#F97316] font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Generating personalized syllabus roadmap...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#0F0F0F] border border-[#27272A] rounded-xl text-white">
              <span>Estimated Duration: <strong className="text-[#F97316]">{plan?.estimatedHours || 2.6} Hours</strong></span>
              <Badge variant="cyan">{plan?.totalDays || 3} Daily Milestones</Badge>
            </div>

            <div className="space-y-3">
              {plan?.schedule?.map((item: any) => (
                <div key={item.day} className="p-4 bg-[#0F0F0F] border border-[#27272A] rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#F97316]/20 text-[#F97316] flex items-center justify-center text-[10px]">
                        Day {item.day}
                      </span>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#06B6D4]" />
                      {item.estimatedMinutes} mins
                    </span>
                  </div>

                  <ul className="space-y-1.5 pl-8 text-[11px] text-[#A1A1AA] list-disc">
                    {item.objectives?.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#27272A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs font-bold rounded-xl orange-glow cursor-pointer"
          >
            Start Learning Roadmap
          </button>
        </div>
      </Card>
    </div>
  );
};
