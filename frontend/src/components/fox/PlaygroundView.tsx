import React, { useRef, useEffect } from 'react';
import {
  ArrowUpIcon,
  BookmarkSimpleIcon,
  StopIcon,
  SparkleIcon,
  BookOpenIcon,
  CodeIcon,
  CpuIcon,
  ArrowRightIcon,
  XIcon
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
        runPrompt();
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
    <div className="flex-1 flex flex-col h-full bg-[#08090d] bg-grid-subtle relative overflow-hidden select-none">
      {/* Ambient Radial Lighting */}
      <div className="absolute inset-0 ambient-glow-purple pointer-events-none" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 relative z-10">
        {!hasMessages ? (
          /* Empty State */
          <div className="h-full min-h-[460px] flex flex-col items-center justify-center text-center px-4 animate-fade-in max-w-3xl mx-auto">
            {/* Ambient Glowing Logo Badge */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 p-0.5 shadow-[0_0_30px_rgba(139,92,246,0.35)] mb-4">
              <div className="w-full h-full bg-[#0c0d14] rounded-[14px] flex items-center justify-center">
                <SparkleIcon className="w-6 h-6 text-purple-400" weight="fill" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              How can I help you today?
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md leading-relaxed">
              Enter a prompt below and press <span className="keycap text-[10px]">Ctrl+Enter</span> or click <span className="font-semibold text-purple-300">Run</span> to get started.
            </p>

            {/* Quick Starter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full text-left">
              {quickPrompts.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => runPrompt(item.prompt)}
                    className="p-3.5 rounded-2xl bg-[#11121b]/80 hover:bg-[#181927] border border-[#1e202f] hover:border-purple-500/50 text-left transition-all duration-200 group shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] cursor-pointer card-shine"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300">
                          {item.category}
                        </span>
                      </div>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
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
                    className={`text-[10px] font-mono text-zinc-500 px-2 flex items-center gap-1.5 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <span className="font-semibold text-purple-300 px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-500/30">
                        {msg.model || selectedModelOption.name.toLowerCase()}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {isUser ? (
                      <div className="bg-gradient-to-b from-[#1c1d2c] to-[#161724] border border-[#2a2c40] text-zinc-100 rounded-2xl rounded-tr-xs px-4 py-3 max-w-[82%] text-sm leading-relaxed shadow-md font-sans">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-b from-[#11121a] to-[#0c0d14] border border-[#1c1e2c] rounded-2xl rounded-tl-xs p-5 sm:p-6 text-zinc-200 w-full max-w-3xl shadow-xl leading-relaxed relative">
                        <MarkdownMessage content={msg.content} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Streaming Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 px-2 py-1 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Thinking & generating tokens...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Area */}
      <div className="p-4 sm:px-8 pb-3 bg-gradient-to-t from-[#08090d] via-[#08090d]/90 to-transparent relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Main Input Box Card */}
          <div className="bg-[#10111a]/95 backdrop-blur-md border border-[#1e202f] hover:border-zinc-700 focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl p-3 shadow-2xl transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Write your prompt here... (Ctrl+Enter to run)"
              className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm outline-none resize-none leading-relaxed px-1 font-sans"
            />

            {/* Action Buttons Bar inside Box */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#1a1b28] mt-1.5">
              {/* Left Details */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                {activeDocId ? (
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40 transition-colors cursor-pointer text-xs"
                  >
                    <BookOpenIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>RAG Document Active</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-500">{promptInput.length} chars</span>
                    {promptInput && (
                      <button
                        onClick={() => setPromptInput('')}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                        title="Clear input"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2">
                {/* Save Prompt as Template Button */}
                <button
                  onClick={onOpenSaveTemplate}
                  disabled={!promptInput.trim()}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  title="Save prompt to reusable templates"
                >
                  <BookmarkSimpleIcon className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                {/* Keyboard Hint */}
                <span className="hidden sm:inline-flex keycap">
                  Ctrl+Enter
                </span>

                {/* Run / Stop Button */}
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <StopIcon className="w-3.5 h-3.5" weight="fill" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => runPrompt()}
                    disabled={!promptInput.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUpIcon className="w-3.5 h-3.5" weight="bold" />
                    <span>Run</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle Disclaimer */}
          <div className="text-center mt-2.5">
            <span className="text-[11px] text-zinc-500 font-mono">
              AI response are mock data for demonstration purpose.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
