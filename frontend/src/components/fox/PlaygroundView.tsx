import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUpIcon,
  BookmarkSimpleIcon,
  StopIcon,
  SparkleIcon,
  BookOpenIcon,
  CodeIcon,
  CpuIcon,
  ArrowRightIcon,
  CopyIcon,
  CheckIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';
import { MarkdownMessage } from './MarkdownMessage';

interface PlaygroundViewProps {
  onOpenSaveTemplate: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({ onOpenSaveTemplate }) => {
  const {
    currentChat,
    promptInput,
    setPromptInput,
    runPrompt,
    isStreaming,
    stopStreaming,
    selectedModelOption,
    activeDocId,
    setActiveTab
  } = usePlayground();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isStreaming]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentChat?.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isStreaming && promptInput.trim()) {
        void runPrompt();
      }
    }
  };

  const hasMessages = currentChat && currentChat.messages.length > 0;

  const quickPrompts = [
    {
      category: 'Education',
      title: "Explain Like I'm Five",
      icon: SparkleIcon,
      prompt: "Explain how neural networks learn in simple terms that anyone can understand, using an intuitive real-world analogy."
    },
    {
      category: 'Engineering',
      title: 'Code Performance & Refactoring',
      icon: CodeIcon,
      prompt: "Analyze this React TypeScript component for unnecessary re-renders, state bottlenecks, and clean architecture practices."
    },
    {
      category: 'Architecture',
      title: 'Distributed System Topology',
      icon: CpuIcon,
      prompt: "Design a fault-tolerant, high-throughput real-time notifications engine with Kafka event streams and PostgreSQL."
    },
    {
      category: 'Algorithms',
      title: 'Algorithm Complexity & Bounds',
      icon: BookOpenIcon,
      prompt: "Compare time and space complexity of QuickSort versus MergeSort, including recursion stack limits and stability trade-offs."
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] relative overflow-hidden select-none">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 relative z-10">
        {!hasMessages ? (
          /* Empty State: Studio Canvas */
          <div className="h-full min-h-[460px] flex flex-col items-center justify-center text-center px-4 animate-fade-in max-w-3xl mx-auto">
            {/* Studio Badge with Integrated Icon Flow */}
            <div className="flex items-center gap-2 mb-3">
              <SparkleIcon className="w-5 h-5 text-indigo-400" weight="duotone" />
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                Prompt Studio Canvas
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Hardware-Speed AI Reasoning.
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-[55ch] leading-relaxed mx-auto">
              Synthesize prompts across {selectedModelOption.name}, stream tokens with zero-latency Server-Sent Events, or index reference documents via PgVector.
            </p>

            {/* Quick Starter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full text-left">
              {quickPrompts.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => void runPrompt(item.prompt)}
                    className="p-4 rounded-xl bg-[#0e1017] hover:bg-[#141622] border border-[#1c1f2e] hover:border-indigo-500/40 text-left transition-all duration-200 group shadow-xs hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-indigo-400" weight="duotone" />
                        <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.prompt}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Conversation Thread */
          <div className="max-w-4xl mx-auto space-y-6 pb-6 animate-fade-in">
            {currentChat.messages.map(msg => {
              const isUser = msg.role === 'user';

              return (
                <div key={msg.id} className="space-y-1.5 animate-slide-up">
                  {/* Timestamp & Model Tag */}
                  <div
                    className={`text-xs font-mono text-zinc-400 px-1 flex items-center gap-2 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <span className="font-semibold text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/30">
                        {msg.model || selectedModelOption.name.toLowerCase()}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Frame Container */}
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {isUser ? (
                      <div className="bg-[#121420] border border-[#212436] text-zinc-100 rounded-xl px-4 py-3 max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-xs font-sans">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-xl p-5 sm:p-6 text-zinc-200 w-full max-w-3xl shadow-sm leading-relaxed relative group">
                        <MarkdownMessage content={msg.content} />
                        
                        {/* Assistant Message Telemetry & Action Bar */}
                        <div className="mt-4 pt-3 border-t border-[#171926] flex items-center justify-between text-xs font-mono text-zinc-400">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Synthesized via SSE Stream</span>
                          </span>

                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white bg-[#141622] hover:bg-[#1a1d2e] border border-[#222436] transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copied</span>
                              </>
                            ) : (
                              <>
                                <CopyIcon className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Streaming Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 px-2 py-1 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Streaming tokens from model gateway...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Area */}
      <div className="p-4 sm:px-8 pb-4 bg-gradient-to-t from-[#08090d] via-[#08090d]/95 to-transparent relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Main Input Box Card */}
          <div className="bg-[#0e1017] border border-[#1c1f2e] focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-2xl p-3 shadow-lg transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Write prompt instructions or question here... (Ctrl+Enter to run)"
              className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-400 outline-none resize-none font-sans leading-relaxed selection:bg-indigo-500/30"
            />

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#171926] mt-1 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                {activeDocId ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 font-mono text-xs">
                    <BookOpenIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Doc Attached</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-300 transition-colors cursor-pointer text-xs"
                  >
                    <BookOpenIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Attach Knowledge Doc</span>
                  </button>
                )}

                <span className="text-zinc-600 hidden sm:inline">•</span>

                <button
                  onClick={onOpenSaveTemplate}
                  disabled={!promptInput.trim()}
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-300 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs"
                  title="Save current prompt as Blueprint"
                >
                  <BookmarkSimpleIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Blueprint</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                  <span className="keycap text-xs">Ctrl+Enter</span>
                </span>

                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <StopIcon className="w-3.5 h-3.5" weight="fill" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => void runPrompt()}
                    disabled={!promptInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95 group"
                  >
                    <span>Run</span>
                    <ArrowUpIcon className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" weight="bold" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
