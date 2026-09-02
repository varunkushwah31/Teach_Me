import React from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';

interface FooterProps {
  onOpenStudio?: (tab?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenStudio }) => {
  return (
    <footer className="border-t border-[#272a2e] bg-[#121317] text-[#878c99] text-[14px]">
      
      {/* Pre-Footer Call to Action Banner */}
      <div className="max-w-300 mx-auto px-4 sm:px-6 py-16 border-b border-[#272a2e]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1c1e21] border border-[#272a2e] p-8 sm:p-10 rounded-sm">
          <div>
            <h2 className="font-bold text-[26px] sm:text-[32px] text-[#e5e7eb] mb-2 tracking-tight">
              Ready to Ace Your Next Exam?
            </h2>
            <p className="text-[15px] text-[#878c99] max-w-130 leading-relaxed">
              Upload your textbook chapters, lecture slides, or syllabus to generate instant quizzes, SM-2 flashcards, and audio podcasts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenStudio?.('documents')}
              className="group flex items-center gap-2 px-5 py-3 bg-[#a8ff53] hover:bg-[#b8ff70] text-[#121317] font-semibold text-[14.5px] rounded-sm shadow-[inset_0_0_0_1px_rgba(168,255,83,0.4)] transition-all cursor-pointer"
            >
              <span>Upload PDF & Study</span>
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Column Links Area */}
      <div className="max-w-300 mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#a8ff53]">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="font-bold text-[18px] text-[#e5e7eb] tracking-tight">
                TeachMe<span className="text-[#a8ff53] font-normal text-[14px]">.study</span>
              </span>
            </div>

            <p className="text-[13px] text-[#878c99] max-w-70 leading-[1.6]">
              Personalized AI study companion for students. Grounded in your uploaded course materials with zero hallucination.
            </p>
          </div>

          {/* Col 2: Study Modes */}
          <div className="space-y-3">
            <div className="font-semibold text-[13.5px] text-[#e5e7eb] uppercase tracking-wider">
              Study Tools
            </div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <button onClick={() => onOpenStudio?.('chat')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  AI Tutor Q&A
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('quiz')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  Diagnostic Practice Quizzes
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('flashcards')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  SM-2 Spaced Flashcards
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('podcast')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  2-Speaker Audio Podcasts
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('outline')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  Cornell Lecture Outlines
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Subjects */}
          <div className="space-y-3">
            <div className="font-semibold text-[13.5px] text-[#e5e7eb] uppercase tracking-wider">
              Sample Subjects
            </div>
            <ul className="space-y-2 text-[13px] text-[#878c99]">
              <li>Cellular Biology & Genetics</li>
              <li>Organic Chemistry Mechanisms</li>
              <li>Data Structures & Algorithms</li>
              <li>Constitutional Law & Precedents</li>
              <li>Physics & Calculus Proofs</li>
            </ul>
          </div>

          {/* Col 4: AI Engines & Sync */}
          <div className="space-y-3">
            <div className="font-semibold text-[13.5px] text-[#e5e7eb] uppercase tracking-wider">
              AI Engines & Sync
            </div>
            <ul className="space-y-2 text-[13px]">
              <li>
                <button onClick={() => onOpenStudio?.('settings')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  100% Free Local Ollama
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('settings')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  OpenAI / Claude API Keys
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('flashcards')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  Export to Anki (.apkg / .txt)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenStudio?.('outline')} className="hover:text-[#a8ff53] transition-colors cursor-pointer">
                  Download Markdown (.md)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="mt-14 pt-6 border-t border-[#272a2e] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-mono">
          <div>
            © {new Date().getFullYear()} TeachMe AI Study Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#1c1e21] border border-[#272a2e] rounded-full text-[#e5e7eb]">
            <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
            <span className="text-[#a8ff53]">Ollama & Vector Store Connected</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
