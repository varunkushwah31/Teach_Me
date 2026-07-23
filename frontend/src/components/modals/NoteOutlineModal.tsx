import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Check, Copy, RefreshCw, ChevronRight } from 'lucide-react';
import { outlineApi } from '../../lib/apiClient';

interface Props {
  documentId: number;
  documentName: string;
  onClose: () => void;
}

export const NoteOutlineModal: React.FC<Props> = ({ documentId, documentName, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    outlineApi.getOutline(documentId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [documentId]);

  const handleCopyOutline = () => {
    if (!data?.sections) return;
    const text = data.sections
      .map((s: any) => `${s.sectionTitle}\n${s.topics.map((t: string) => `  • ${t}`).join('\n')}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-2xl w-full p-6 space-y-6 relative border-[#F97316]/40 shadow-2xl bg-[#0D0D17] max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Note Outline Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A] shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#D946EF]/20 text-[#F97316] orange-glow">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Hierarchical Study Outline & Formula Cheatsheet</span>
              <Badge variant="orange">Auto-Generated</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono truncate max-w-md mt-0.5">{documentName}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#F97316] font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Structuring hierarchical outline & key physics formulas...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
            {data?.sections?.map((sec: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-[#06060A]/80 border border-white/5 space-y-2">
                <h3 className="font-bold text-sm text-[#F97316] flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[#F97316]" />
                  <span>{sec.sectionTitle}</span>
                </h3>
                <ul className="space-y-1.5 pl-6 text-[#94A3B8] font-sans text-xs list-disc">
                  {sec.topics?.map((topic: string, tIdx: number) => (
                    <li key={tIdx} className="leading-relaxed">{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-[#27272A] flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={handleCopyOutline}
            disabled={loading}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/5 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#06B6D4]" />}
            <span>{copied ? 'Outline Copied' : 'Copy Cheatsheet'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs font-bold rounded-xl orange-glow cursor-pointer"
          >
            Close Outline
          </button>
        </div>
      </Card>
    </div>
  );
};
