import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, FileText, MessageSquare, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  initialQuery?: string;
  onClose: () => void;
}

export const GlobalSearchCommand: React.FC<Props> = ({ initialQuery = '', onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const searchResults = [
    {
      type: 'document',
      title: 'Quantum_Physics.pdf',
      snippet: 'Heisenberg uncertainty relation Δx * Δp ≥ h / 4π and wavefunctions...',
      path: '/documents',
      badge: 'PDF Document',
    },
    {
      type: 'chat',
      title: 'Session session-123: Wave Mechanics',
      snippet: 'Q: Explain Schrödinger wave equation. A: The time-dependent equation...',
      path: '/chat',
      badge: 'AI Tutor Session',
    },
    {
      type: 'flashcard',
      title: 'Flashcard: Heisenberg Uncertainty',
      snippet: 'Front: What is Δx * Δp? Back: Lower bound of quantum precision limit.',
      path: '/study',
      badge: 'SM-2 Flashcard',
    },
    {
      type: 'quiz',
      title: 'Quiz: Subatomic Particle Physics',
      snippet: '5-question multiple choice quiz derived from Quantum_Physics.pdf',
      path: '/study',
      badge: 'Active Quiz',
    },
  ].filter(
    (item) =>
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.snippet.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
      <Card variant="default" className="max-w-2xl w-full p-4 space-y-4 shadow-2xl border-[#F97316]/40 relative bg-[#0D0D17]">
        <div className="relative flex items-center border-b border-[#27272A] pb-3">
          <Search className="w-5 h-5 text-[#F97316] absolute left-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search documents, RAG chats, flashcards, or quizzes..."
            className="w-full bg-transparent pl-11 pr-10 text-sm text-white focus:outline-none placeholder-[#A1A1AA] font-sans"
          />
          <button onClick={onClose} aria-label="Close Search" className="absolute right-2 p-1 text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <button
                key={`${item.type}-${item.title}`}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full text-left p-3 bg-[#0F0F0F] border border-[#27272A] hover:border-[#F97316]/50 rounded-xl flex items-center justify-between cursor-pointer transition-all group focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#27272A] group-hover:bg-[#F97316]/20 transition-colors">
                    {item.type === 'document' && <FileText className="w-4 h-4 text-[#F97316]" />}
                    {item.type === 'chat' && <MessageSquare className="w-4 h-4 text-[#06B6D4]" />}
                    {item.type === 'flashcard' && <Layers className="w-4 h-4 text-[#D946EF]" />}
                    {item.type === 'quiz' && <Sparkles className="w-4 h-4 text-[#F97316]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white group-hover:text-[#F97316] transition-colors">
                        {item.title}
                      </p>
                      <Badge variant="outline">{item.badge}</Badge>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5 line-clamp-1">{item.snippet}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-[#A1A1AA] font-mono">
              No matching documents or chat sessions found for "{query}".
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#27272A] flex justify-between items-center text-[10px] text-[#A1A1AA] font-mono">
          <span>Press ESC to exit search</span>
          <span>TeachMe AI Global Command Palette</span>
        </div>
      </Card>
    </div>
  );
};
