import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Activity, BookOpen, Layers, Sparkles, Volume2 } from 'lucide-react';

export const ObservabilitySection: React.FC = () => {
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount(prev => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="study-engine" className="py-24 border-t border-[#272a2e] bg-[#1c1e21] relative overflow-hidden font-['Geist']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 max-w-[750px]">
          <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-['Geist_Mono'] text-[13px] font-medium mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Autonomous Study Processing Engine</span>
          </div>
          <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[38px] text-[#e5e7eb] mb-3">
            Asynchronous AI Workflows for Instant Course Prep
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#878c99] leading-[1.58]">
            When you upload course notes or textbooks, TeachMe processes vector chunks, generates diagnostic quizzes, and calculates SM-2 spaced repetition schedules in the background.
          </p>
        </div>

        {/* Two-Column Display: Study Task Monitor on Left, Value Proposition on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Study Pipeline Console Pane */}
          <div className="lg:col-span-7 bg-[#121317] border border-[#272a2e] rounded-[4px] p-6 shadow-2xl font-['Geist_Mono']">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#272a2e]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#a8ff53]" />
                <span className="text-[14px] font-semibold text-[#e5e7eb]">Active Study Pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#878c99]">
                <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-ping" />
                <span>Ollama / PgVector Connected</span>
              </div>
            </div>

            {/* Study Task Rows */}
            <div className="space-y-3">
              {/* Row 1: PDF Vector Ingestion */}
              <div className="flex items-center justify-between p-3 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] hover:border-[#3b3e45] transition-colors">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#a8ff53]" />
                  <span className="text-[13px] text-[#e5e7eb] font-medium truncate max-w-[280px]">
                    chunk_pdf(Biology_Ch4_Cellular_Respiration.pdf)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#afec73]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>48 Chunks (1.2s)</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#272a2e] text-[#a8ff53] text-[10px] rounded-[3px]">
                    PgVector
                  </span>
                </div>
              </div>

              {/* Row 2: Bloom Auto-Quiz */}
              <div className="flex items-center justify-between p-3 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] hover:border-[#3b3e45] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#fa3abf]" />
                  <span className="text-[13px] text-[#e5e7eb] font-medium truncate max-w-[280px]">
                    generate_bloom_quiz(Organic_Chemistry_SN2)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#afec73]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>5 MCQs Ready</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#272a2e] text-[#fa3abf] text-[10px] rounded-[3px]">
                    Quiz AI
                  </span>
                </div>
              </div>

              {/* Row 3: SM-2 Ease Recalculation */}
              <div className="flex items-center justify-between p-3 bg-[#1c1e21] border border-[#7655fd]/30 rounded-[4px] shadow-[0_0_15px_rgba(118,85,253,0.08)]">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#9c9af2]" />
                  <span className="text-[13px] text-[#e5e7eb] font-medium truncate max-w-[280px]">
                    sm2_recalculate_ease(Neuroscience_Deck)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#9c9af2]">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>EF: 2.65 • Next: 6d</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#7655fd]/20 text-[#9c9af2] text-[10px] font-semibold rounded-[3px]">
                    Active
                  </span>
                </div>
              </div>

              {/* Row 4: 2-Speaker AI Podcast */}
              <div className="flex items-center justify-between p-3 bg-[#1c1e21] border border-[#272a2e] rounded-[4px] hover:border-[#3b3e45] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-[#d9f07c]" />
                  <span className="text-[13px] text-[#e5e7eb] font-medium truncate max-w-[280px]">
                    synthesize_audio_podcast(Relativity_Alex_Maya)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#afec73]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>8-Min Episode</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#272a2e] text-[#d9f07c] text-[10px] rounded-[3px]">
                    Audio TTS
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Realtime Pulse Telemetry */}
            <div className="mt-4 pt-3 border-t border-[#272a2e] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#878c99]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff53]" /> 48 Chunks Indexed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9c9af2]" /> PgVector Cosine: 14ms
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#afec73]" /> 100% Private (Local Ollama)
                </span>
              </div>
              <span className="text-[#a8ff53]">Study Sync #{1420 + pulseCount}</span>
            </div>
          </div>

          {/* Right: Descriptive Value Proposition */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[#9c9af2] font-['Geist_Mono'] text-[13px] font-medium">
              <span>Zero Hallucination Retrieval</span>
            </div>

            <h3 className="font-['Satoshi'] font-semibold text-[30px] sm:text-[34px] leading-[1.15] text-[#e5e7eb]">
              Study faster with AI grounded exclusively in your course material.
            </h3>

            <p className="text-[15.5px] leading-[1.58] text-[#878c99]">
              Unlike generic chatbots that guess, TeachMe retrieves vector chunks directly from your uploaded syllabus and textbooks. Every quiz question, flashcard, and explanation includes exact page and chapter citations.
            </p>

            <div className="pt-3 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a8ff53] mt-2" />
                <div>
                  <span className="text-[#e5e7eb] font-medium text-[14px]">Verifiable Textbook Footnotes:</span>
                  <p className="text-[#878c99] text-[13px]">Click any citation to verify against the exact page in your uploaded PDF.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9c9af2] mt-2" />
                <div>
                  <span className="text-[#e5e7eb] font-medium text-[14px]">Permanent SM-2 Spaced Retention:</span>
                  <p className="text-[#878c99] text-[13px]">Adaptive memory algorithms ensure you review difficult concepts right before forgetting.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
