import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CopyIcon, CheckIcon, CodeIcon } from '@phosphor-icons/react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyFull = () => {
    void navigator.clipboard.writeText(content);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCopyCodeBlock = (codeText: string, idx: number) => {
    void navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  let codeBlockCounter = 0;

  return (
    <div className="relative group">
      <div className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans space-y-3">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed text-zinc-300 max-w-[68ch]">{children}</p>,
            h1: ({ children }) => (
              <h1 className="text-base font-bold text-white mb-2 pt-1 border-b border-[#212436] pb-1">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold text-white mb-1.5 pt-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-semibold text-zinc-200 mb-1 uppercase tracking-wider">
                {children}
              </h3>
            ),
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 my-2.5 text-zinc-300">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 my-2.5 text-zinc-300">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="border border-indigo-500/30 bg-indigo-950/20 px-3.5 py-2 rounded-xl italic text-zinc-300 my-2.5">
                {children}
              </blockquote>
            ),
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const isInline = !match && !codeString.includes('\n');

              if (isInline) {
                return (
                  <code
                    className="bg-[#141624] text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded text-xs font-mono font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              const currentIdx = ++codeBlockCounter;
              const isCopied = copiedCodeIdx === currentIdx;

              return (
                <div className="relative my-3 rounded-xl overflow-hidden border border-[#212336] bg-[#090a10] shadow-sm group/code">
                  {/* Code Header Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#10111a] border-b border-[#212336] text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <CodeIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-semibold text-zinc-300 uppercase tracking-wider text-xs">
                        {match ? match[1] : 'code'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCodeBlock(codeString, currentIdx)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors text-xs cursor-pointer"
                      title="Copy code snippet"
                    >
                      {isCopied ? (
                        <>
                          <CheckIcon className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pre/Code */}
                  <pre className="p-4 text-xs overflow-x-auto text-zinc-200 font-mono leading-relaxed bg-[#090a10]">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Message Footer Action Bar */}
      <div className="mt-4 pt-3 border-t border-[#171926] flex items-center justify-between">
        <button
          onClick={handleCopyFull}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1 rounded-lg hover:bg-zinc-800/50 cursor-pointer active:scale-95"
          title="Copy response to clipboard"
        >
          {copiedFull ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied to clipboard</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              <span>Copy Response</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
