import React, { useState, useEffect } from 'react';
import { Sparkles, User, CheckCircle2, ArrowRight } from 'lucide-react';

interface RealtimeStreamsSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

export const RealtimeStreamsSection: React.FC<RealtimeStreamsSectionProps> = ({ onOpenStudio }) => {
  const [typedOutput, setTypedOutput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePrompt, setActivePrompt] = useState('Explain SM-2 Spaced Repetition in TeachMe');

  const SAMPLE_RESPONSES: Record<string, string> = {
    'Explain SM-2 Spaced Repetition in TeachMe':
      'The SuperMemo-2 (SM-2) algorithm computes optimal review intervals based on recall quality q (0-5). TeachMe recalculates the Ease Factor (EF) after every flashcard submission: EF\' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)). If quality >= 3, interval I(n) scales exponentially, guaranteeing maximum long-term memory retention.',
    'How does Map-Reduce Document Summarization work?':
      'TeachMe splits massive 100+ page PDFs into 500-token chunks. The MAP phase prompts parallel Spring AI workers to extract key concepts per chunk simultaneously. The REDUCE phase then synthesizes all intermediate summaries into a cohesive, non-redundant 300-word executive brief in under 2 seconds.',
    'Show Spring AI ChatClient tool calling':
      'Spring AI exposes `@Tool` annotated methods to LLM models like Ollama or GPT-4o. When a student asks about their quiz readiness, ChatClient invokes `queryVectorStore()` to retrieve verified textbook citations before streaming markdown responses back to the React UI via Server-Sent Events.'
  };

  const startStream = (prompt: string) => {
    setActivePrompt(prompt);
    setIsTyping(true);
    setTypedOutput('');

    const fullText = SAMPLE_RESPONSES[prompt] || SAMPLE_RESPONSES['Explain SM-2 Spaced Repetition in TeachMe'];
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx <= fullText.length) {
        setTypedOutput(fullText.slice(0, idx));
        idx += 3;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
  };

  useEffect(() => {
    startStream('Explain SM-2 Spaced Repetition in TeachMe');
  }, []);

  return (
    <section className="py-24 border-t border-[#272a2e] bg-[#1c1e21]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Top Text Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-[700px]">
            <div className="inline-flex items-center gap-1.5 text-[#9c9af2] font-['Geist_Mono'] text-[13px] font-medium mb-3">
              <span>Realtime Server-Sent Events</span>
            </div>

            <h2 className="font-['Satoshi'] font-semibold text-[32px] sm:text-[40px] leading-[1.1] text-[#e5e7eb] mb-4">
              Stream LLM Reasoning & Citations in Real-Time
            </h2>

            <p className="font-['Geist'] text-[16px] text-[#878c99] leading-[1.56]">
              Pipe thought chains, tokens, and verified document citations from Spring AI directly to your React client with low-latency Server-Sent Events.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('chat')}
            className="group mt-4 md:mt-0 inline-flex items-center gap-1.5 text-[14px] font-['Geist'] text-[#a8ff53] hover:underline cursor-pointer"
          >
            <span>Try live stream in Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mock Chat Window Container */}
        <div className="bg-[#121317] border border-[#272a2e] rounded-[4px] p-4 sm:p-6 shadow-2xl relative">
          
          <div className="text-center text-[12px] text-[#878c99] mb-4 font-['Geist_Mono']">
            POST /api/chat/ask/stream • Live Server-Sent Events (SSE) Pipe
          </div>

          {/* Chat Window Frame */}
          <div className="max-w-[750px] mx-auto bg-[#1c1e21] border border-[#272a2e] rounded-[4px] overflow-hidden">
            
            {/* Window Header */}
            <div className="p-3 bg-[#15171c] border-b border-[#272a2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#d9f07c]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#afec73]" />
                <span className="text-[12px] text-[#878c99] font-['Geist_Mono'] ml-2">
                  tutor-stream.sse
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#a8ff53] font-['Geist_Mono']">
                <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
                <span>CONNECTED</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-5 space-y-4">
              
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-[#272a2e] border border-[#3b3e45] text-[#e5e7eb] px-4 py-2.5 rounded-[4px] text-[14px]">
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-[#878c99]">
                    <User className="w-3 h-3 text-[#a8ff53]" />
                    <span>Student / User</span>
                  </div>
                  {activePrompt}
                </div>
              </div>

              {/* AI Agent Response */}
              <div className="flex justify-start">
                <div className="max-w-[90%] bg-[#121317] border border-[#272a2e] text-[#e5e7eb] p-4 rounded-[4px] text-[14px] font-['Geist'] leading-[1.6]">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#272a2e]">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#9c9af2] font-['Geist_Mono']">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>TeachMe AI Tutor</span>
                    </div>
                    <span className="text-[11px] text-[#afec73] font-['Geist_Mono']">
                      PgVector: 4 chunks retrieved
                    </span>
                  </div>

                  <p className="text-[#d7d9dd] whitespace-pre-wrap">
                    {typedOutput}
                    {isTyping && <span className="inline-block w-2 h-4 bg-[#a8ff53] ml-1 animate-pulse" />}
                  </p>

                  {!isTyping && (
                    <div className="mt-3 pt-2 border-t border-[#272a2e]/60 flex items-center gap-2 text-[11px] text-[#878c99]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#a8ff53]" />
                      <span>Verified against document source (PDF p. 12-14)</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Prompt Selectors */}
            <div className="p-3 bg-[#15171c] border-t border-[#272a2e] flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-[#878c99]">Test live prompt:</span>
              {Object.keys(SAMPLE_RESPONSES).map((promptKey) => (
                <button
                  key={promptKey}
                  onClick={() => startStream(promptKey)}
                  className={`text-[12px] px-2.5 py-1 rounded-[3px] font-['Geist'] transition-colors cursor-pointer ${
                    activePrompt === promptKey
                      ? 'bg-[#a8ff53] text-[#121317] font-medium'
                      : 'bg-[#1c1e21] hover:bg-[#272a2e] text-[#d7d9dd] border border-[#272a2e]'
                  }`}
                >
                  {promptKey.split(' ')[0]} {promptKey.split(' ')[1]}...
                </button>
              ))}
            </div>

          </div>

          <div className="text-center text-[12px] text-[#878c99] mt-4 font-['Geist_Mono']">
            Sub-50ms token latency with Spring AI Server-Sent Events
          </div>

        </div>

      </div>
    </section>
  );
};
