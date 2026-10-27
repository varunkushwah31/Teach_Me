import React from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';

interface FooterProps {
  onOpenStudio?: (tab?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStudio }) => {
  return (
    <footer className="border-t border-[#1c1f2e] bg-[#08090d] text-zinc-400 text-xs font-sans">
      
      {/* Pre-Footer Call to Action Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-b border-[#1c1f2e]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0e1017] border border-[#1c1f2e] p-8 sm:p-10 rounded-3xl shadow-xl">
          <div>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white mb-2 tracking-tight">
              Ready to Master Your Course Material?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Upload your textbook chapters, lecture slides, or syllabus to generate instant quizzes, SM-2 flashcards, and audio podcasts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenStudio?.('documents')}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95 group"
            >
              <span>Upload PDF &amp; Study</span>
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Column Links Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
              <span className="font-extrabold text-base text-white tracking-tight">
                TeachMe<span className="text-indigo-400 font-normal text-xs">.study</span>
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
              Personalized AI study companion for students. Grounded in your uploaded course materials with zero hallucination.
            </p>
          </div>

          {/* Col 2: Study Modes */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Study Tools
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenStudio?.('chat')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  AI Tutor Q&amp;A
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('quiz')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  Diagnostic Practice Quizzes
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('flashcards')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  SM-2 Spaced Flashcards
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('podcast')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  2-Speaker Audio Podcasts
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('outline')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  Cornell Lecture Outlines
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Subjects */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Sample Subjects
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>Cellular Biology &amp; Genetics</li>
              <li>Organic Chemistry Mechanisms</li>
              <li>Data Structures &amp; Algorithms</li>
              <li>Constitutional Law &amp; Precedents</li>
              <li>Physics &amp; Calculus Proofs</li>
            </ul>
          </div>

          {/* Col 4: AI Engines & Sync */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              AI Engines &amp; Sync
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenStudio?.('settings')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  100% Free Local Ollama
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('settings')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  OpenAI / Claude API Keys
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('flashcards')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  Export to Anki (.apkg / .txt)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('outline')} className="hover:text-indigo-300 transition-colors cursor-pointer">
                  Download Markdown (.md)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="mt-14 pt-6 border-t border-[#1c1f2e] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div>
            &copy; {new Date().getFullYear()} TeachMe AI Study Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#0e1017] border border-[#1c1f2e] rounded-full text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300">Ollama &amp; PgVector Store Connected</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
