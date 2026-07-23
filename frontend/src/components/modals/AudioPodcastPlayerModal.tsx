import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Play, Pause, Volume2, Sparkles, RefreshCw, Mic } from 'lucide-react';
import { audioApi } from '../../lib/apiClient';

interface Props {
  documentId: number;
  documentName: string;
  onClose: () => void;
}

export const AudioPodcastPlayerModal: React.FC<Props> = ({ documentId, documentName, onClose }) => {
  const [podcastData, setPodcastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    audioApi.generatePodcast(documentId).then((res) => {
      setPodcastData(res);
      setLoading(false);
    });
  }, [documentId]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-2xl w-full p-6 space-y-6 relative border-[#D946EF]/40 shadow-2xl bg-[#0D0D17] max-h-[85vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Audio Podcast Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A] shrink-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D946EF]/20 to-[#F97316]/20 text-[#D946EF] orange-glow">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>NotebookLM-Style AI Study Podcast</span>
              <Badge variant="orange">2-Speaker AI Dialogue</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono truncate max-w-md mt-0.5">{documentName}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#D946EF] font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Generating 2-speaker audio dialogue breakdown...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
            {/* Audio Player Card */}
            <div className="p-4 bg-[#0F0F0F] border border-[#27272A] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate max-w-xs">{podcastData?.title}</span>
                <span className="text-[10px] text-[#A1A1AA]">{podcastData?.durationSeconds}s duration</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#F97316] to-[#D946EF] h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white flex items-center justify-center orange-glow cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="flex items-center gap-2 text-[#94A3B8]">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-[10px]">High-Fidelity AI Dialogue</span>
                </div>
              </div>
            </div>

            {/* Dialogue Transcript */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider">AI Dialogue Transcript:</p>
              {podcastData?.dialogue?.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-[#F97316] uppercase">{item.speaker}</span>
                  <p className="text-xs text-white leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#27272A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#D946EF] to-[#F97316] hover:opacity-95 text-white text-xs font-bold rounded-xl orange-glow cursor-pointer"
          >
            Close Audio Player
          </button>
        </div>
      </Card>
    </div>
  );
};
