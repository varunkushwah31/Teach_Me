import React, { useState } from 'react';
import {
  HelpCircle,
  Layers,
  Sparkles,
  Volume2,
  CheckCircle,
  Play,
  ArrowRight
} from 'lucide-react';

interface FeatureShowcaseSectionProps {
  onOpenStudio?: (initialTab?: string) => void;
}

export const FeatureShowcaseSection: React.FC<FeatureShowcaseSectionProps> = ({ onOpenStudio }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcard' | 'summary' | 'podcast'>('quiz');

  return (
    <section id="features" className="py-24 border-t border-[#272a2e] bg-[#1c1e21]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-[700px] mb-12">
          <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-['Geist_Mono'] text-[13px] font-medium mb-3">
            <span>Student Study Toolkit</span>
          </div>

          <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[40px] text-[#e5e7eb] mb-4">
            Master Any Course Subject with Active Recall
          </h2>

          <p className="font-['Geist'] text-[16px] text-[#878c99] leading-[1.58]">
            Transform your study routine with diagnostic auto-quizzes, adaptive SM-2 memory retention, executive chapter summaries, and 2-speaker conversational audio podcasts.
          </p>
        </div>

        {/* Feature Interactive Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#272a2e] pb-3">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-[14px] font-['Geist'] transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#121317] border border-[#a8ff53]/50 text-[#e5e7eb] shadow-[0_0_15px_rgba(168,255,83,0.08)]'
                : 'text-[#878c99] hover:text-[#e5e7eb] hover:bg-[#121317]/50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#a8ff53]" />
            <span>1. Auto-Quiz Generation</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-[14px] font-['Geist'] transition-all cursor-pointer ${
              activeTab === 'flashcard'
                ? 'bg-[#121317] border border-[#9c9af2]/50 text-[#e5e7eb] shadow-[0_0_15px_rgba(156,154,242,0.08)]'
                : 'text-[#878c99] hover:text-[#e5e7eb] hover:bg-[#121317]/50'
            }`}
          >
            <Layers className="w-4 h-4 text-[#9c9af2]" />
            <span>2. SM-2 Spaced Repetition</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-[14px] font-['Geist'] transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-[#121317] border border-[#fa3abf]/50 text-[#e5e7eb] shadow-[0_0_15px_rgba(250,58,191,0.08)]'
                : 'text-[#878c99] hover:text-[#e5e7eb] hover:bg-[#121317]/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#fa3abf]" />
            <span>3. Map-Reduce Summaries</span>
          </button>

          <button
            onClick={() => setActiveTab('podcast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-[14px] font-['Geist'] transition-all cursor-pointer ${
              activeTab === 'podcast'
                ? 'bg-[#121317] border border-[#afec73]/50 text-[#e5e7eb] shadow-[0_0_15px_rgba(175,236,115,0.08)]'
                : 'text-[#878c99] hover:text-[#e5e7eb] hover:bg-[#121317]/50'
            }`}
          >
            <Volume2 className="w-4 h-4 text-[#afec73]" />
            <span>4. AI Audio Podcast</span>
          </button>
        </div>

        {/* Feature Detail Panes */}
        <div className="bg-[#121317] border border-[#272a2e] rounded-[4px] p-6 sm:p-8 shadow-2xl">
          
          {/* TAB 1: Auto-Quiz */}
          {activeTab === 'quiz' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="text-[12px] font-['Geist_Mono'] text-[#a8ff53]">POST /api/quiz/generate/&#123;documentId&#125;</div>
                <h3 className="font-['Satoshi'] font-semibold text-[26px] text-[#e5e7eb]">
                  Automated 5-Question Multiple Choice Quizzes
                </h3>
                <p className="text-[15px] text-[#878c99] leading-[1.6]">
                  TeachMe analyzes semantic vectors across document chapters to draft targeted diagnostic assessments. Students receive immediate feedback, rationales, and exact textbook citations.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#a8ff53]" />
                    <span>Bloom's Taxonomy cognitive alignment</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#a8ff53]" />
                    <span>Adaptive passing score thresholds (default: 80%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#a8ff53]" />
                    <span>Post-exam readiness scoring and gap recommendations</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('quiz')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[14px] rounded-[4px] hover:bg-[#b8ff70] cursor-pointer"
                  >
                    <span>Launch Quiz Generator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Interactive Quiz Preview */}
              <div className="lg:col-span-6 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#272a2e]">
                  <span className="text-[12px] font-['Geist_Mono'] text-[#878c99]">Question 1 of 5</span>
                  <span className="text-[11px] px-2 py-0.5 bg-[#a8ff53]/10 text-[#a8ff53] rounded">Pass Score: 80%</span>
                </div>
                <div className="text-[15px] font-medium text-[#e5e7eb] mb-4">
                  What is the primary role of PgVector in Spring AI?
                </div>
                <div className="space-y-2 mb-4">
                  <div className="p-2.5 bg-[#121317] border border-[#a8ff53] rounded-[4px] text-[13px] text-[#e5e7eb] flex items-center justify-between">
                    <span>A. Store high-dimensional embeddings for cosine similarity</span>
                    <CheckCircle className="w-4 h-4 text-[#a8ff53]" />
                  </div>
                  <div className="p-2.5 bg-[#121317] border border-[#272a2e] rounded-[4px] text-[13px] text-[#878c99]">
                    B. Compile React components into WebAssembly
                  </div>
                  <div className="p-2.5 bg-[#121317] border border-[#272a2e] rounded-[4px] text-[13px] text-[#878c99]">
                    C. Manage long-running HTTP timeouts
                  </div>
                </div>
                <div className="p-3 bg-[#121317]/80 border-l-2 border-[#a8ff53] text-[12px] text-[#878c99]">
                  <span className="text-[#a8ff53] font-medium">Explanation:</span> PgVector enables PostgreSQL to index and query vector embeddings at sub-50ms latency.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Flashcards */}
          {activeTab === 'flashcard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="text-[12px] font-['Geist_Mono'] text-[#9c9af2]">POST /api/flashcards/&#123;id&#125;/review</div>
                <h3 className="font-['Satoshi'] font-semibold text-[26px] text-[#e5e7eb]">
                  SM-2 Spaced Repetition Flashcards
                </h3>
                <p className="text-[15px] text-[#878c99] leading-[1.6]">
                  Highlight any AI response or textbook passage to generate an intelligent flashcard deck. The SM-2 algorithm dynamically calculates review intervals based on your self-rated recall difficulty.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#9c9af2]" />
                    <span>Dynamic Ease Factor calculation (min EF: 1.3)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#9c9af2]" />
                    <span>Due deck reviews with automatic reminder queues</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#9c9af2]" />
                    <span>Direct one-click export to Anki (.apkg)</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('flashcards')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[14px] rounded-[4px] hover:bg-[#b8ff70] cursor-pointer"
                  >
                    <span>Practice Flashcards</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Flashcard Deck Preview */}
              <div className="lg:col-span-6 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-6 text-center">
                <div className="text-[12px] font-['Geist_Mono'] text-[#9c9af2] mb-3">Deck: Spring AI Fundamentals</div>
                <div className="p-6 bg-[#121317] border border-[#3b3e45] rounded-[4px] mb-4 min-h-[140px] flex flex-col items-center justify-center">
                  <div className="text-[11px] text-[#878c99] mb-1">FRONT</div>
                  <div className="text-[16px] font-medium text-[#e5e7eb]">What does the Ease Factor (EF) determine in SM-2?</div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[12px] text-[#878c99] mr-2">Rate recall:</span>
                  {[0, 1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      className="w-8 h-8 rounded-[4px] bg-[#121317] hover:bg-[#272a2e] border border-[#272a2e] text-[13px] font-['Geist_Mono'] text-[#e5e7eb] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Map-Reduce */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="text-[12px] font-['Geist_Mono'] text-[#fa3abf]">POST /api/summary/generate/&#123;documentId&#125;</div>
                <h3 className="font-['Satoshi'] font-semibold text-[26px] text-[#e5e7eb]">
                  One-Click Map-Reduce Summarizer
                </h3>
                <p className="text-[15px] text-[#878c99] leading-[1.6]">
                  Process 100+ page documents with zero hallucination. TeachMe executes parallel MAP prompts over 50+ vector chunks, then performs REDUCE synthesis into an executive 300-word brief.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#fa3abf]" />
                    <span>Auto-triggers on documents with 50+ chunks</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#fa3abf]" />
                    <span>Retains key formulas, dates, and theorem names</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#fa3abf]" />
                    <span>Exportable as Markdown, PDF, or study guide</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('summarizer')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[14px] rounded-[4px] hover:bg-[#b8ff70] cursor-pointer"
                  >
                    <span>Try Document Summarizer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Map Reduce Architecture Visual */}
              <div className="lg:col-span-6 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-5 font-['Geist_Mono'] text-[12px]">
                <div className="text-[#878c99] mb-3">Map-Reduce Execution Pipeline:</div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#121317] border border-[#fa3abf]/40 rounded text-[#e5e7eb] flex items-center justify-between">
                    <span>1. Document Chunk Splitter (500 tokens/chunk)</span>
                    <span className="text-[#afec73]">64 Chunks</span>
                  </div>
                  <div className="p-2.5 bg-[#121317] border border-[#272a2e] rounded text-[#878c99] flex items-center justify-between">
                    <span>2. Parallel MAP Extraction (Spring AI Workers)</span>
                    <span className="text-[#9c9af2]">Parallel 64x</span>
                  </div>
                  <div className="p-2.5 bg-[#121317] border border-[#a8ff53]/40 rounded text-[#a8ff53] flex items-center justify-between">
                    <span>3. REDUCE Synthesis (Executive Brief)</span>
                    <span>285 Words</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Audio Podcast */}
          {activeTab === 'podcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="text-[12px] font-['Geist_Mono'] text-[#afec73]">POST /api/podcast/generate/&#123;documentId&#125;</div>
                <h3 className="font-['Satoshi'] font-semibold text-[26px] text-[#e5e7eb]">
                  AI Audio Podcast & Lecture Generator
                </h3>
                <p className="text-[15px] text-[#878c99] leading-[1.6]">
                  Convert textbook chapters into conversational 2-host audio podcasts. Ideal for audio learners commuting or reviewing on the go.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#afec73]" />
                    <span>Host A & Host B natural dialogue generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#afec73]" />
                    <span>FFmpeg audio stitching and pitch normalization</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px] text-[#d7d9dd]">
                    <CheckCircle className="w-4 h-4 text-[#afec73]" />
                    <span>Downloadable MP3 with time-coded lecture notes</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('podcast')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[14px] rounded-[4px] hover:bg-[#b8ff70] cursor-pointer"
                  >
                    <span>Generate Audio Episode</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Audio Waveform Mock Preview */}
              <div className="lg:col-span-6 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[15px] font-semibold text-[#e5e7eb]">Episode 4: Deep Dive into Spring Vector Stores</div>
                    <div className="text-[12px] text-[#878c99]">AI Co-hosts: Alex & Maya • 8 mins</div>
                  </div>
                  <div className="p-3 rounded-full bg-[#a8ff53] text-[#121317] cursor-pointer hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
                {/* Visual Audio Bars */}
                <div className="flex items-center gap-1.5 h-16 bg-[#121317] p-3 rounded border border-[#272a2e] mb-3">
                  {[20, 45, 80, 60, 30, 90, 100, 70, 40, 85, 95, 65, 35, 75, 90, 50, 60, 80, 40, 70, 85, 60, 45].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 bg-[#afec73] rounded-full opacity-80"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[11px] font-['Geist_Mono'] text-[#878c99]">
                  <span>02:14</span>
                  <span>08:32</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
