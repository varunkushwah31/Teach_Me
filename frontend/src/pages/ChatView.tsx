import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Paperclip, BookmarkPlus, Quote, Check, Bot, User } from 'lucide-react';
import { streamChatResponse, citationApi, flashcardApi } from '../lib/apiClient';
import { Badge } from '@/components/ui/badge';

interface CitationItem {
  id: number;
  citationIndex: number;
  documentName: string;
  pageNumber: number;
  quote: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: CitationItem[];
}

const appendChunkToMessages = (msgList: Message[], msgId: string, chunk: string): Message[] => {
  return msgList.map((msg) => (msg.id === msgId ? { ...msg, text: msg.text + chunk } : msg));
};

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your **TeachMe AI Academic Assistant**. Ask me questions about your uploaded documents, wave equations, or study topics. All answers cite verified source pages! **[1]**',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const selectedDocId = 'default-session';

  // Flashcard save modal state
  const [flashcardModal, setFlashcardModal] = useState<{ open: boolean; front: string; back: string; deckName: string }>({
    open: false,
    front: '',
    back: '',
    deckName: 'Physics 101',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    // Load active citations for session
    citationApi.getByChat(selectedDocId).then((res) => {
      if (res && Array.isArray(res)) setCitations(res);
    });
  }, [selectedDocId]);

  const handleSend = () => {
    if (!inputQuery.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setInputQuery('');
    setIsStreaming(true);

    streamChatResponse(
      userMsg.text,
      selectedDocId,
      (chunk) => {
        setMessages((prev) => appendChunkToMessages(prev, aiMsgId, chunk));
      },
      () => {
        setIsStreaming(false);
      },
      (err) => {
        console.error('Streaming error', err);
        setIsStreaming(false);
      }
    );
  };

  const handleSaveFlashcard = async () => {
    try {
      await flashcardApi.create({
        front: flashcardModal.front,
        back: flashcardModal.back,
        deckName: flashcardModal.deckName,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setFlashcardModal({ open: false, front: '', back: '', deckName: 'General' });
      }, 1500);
    } catch (err) {
      console.error('Failed to create flashcard', err);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-6.5rem)] max-w-7xl mx-auto relative font-sans">
      {/* Left Sidebar - Chat Workspace */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header Banner */}
        <div className="pb-3 border-b border-white/5 flex items-center justify-between flex-shrink-0 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-heading">
              <span>Study Workspace</span>
              <Badge variant="cyan">RRF Hybrid Search</Badge>
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Ask questions with verified citations from your vector store.
            </p>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] text-white'
                      : 'bg-gradient-to-br from-[#F97316] to-[#D946EF] text-white orange-glow'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div className="space-y-1.5 group max-w-[85%]">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 border border-orange-500/20 text-white rounded-tr-none shadow-[inset_0_0_15px_rgba(249,115,22,0.02)]'
                        : 'bg-white/5 border border-white/5 text-[#F8FAFC] rounded-tl-none hover:bg-white/[0.07]'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-invert prose-xs text-[#F8FAFC] max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text || (isStreaming ? 'Thinking & searching vector store...' : '')}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Message Meta & Actions */}
                  <div className="flex items-center gap-2 px-1 text-[10px] text-[#94A3B8] font-mono">
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.text && (
                      <button
                        onClick={() =>
                          setFlashcardModal({
                            open: true,
                            front: 'Key Quantum Physics Question',
                            back: msg.text.slice(0, 300),
                            deckName: 'Physics 101',
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#F97316] hover:underline flex items-center gap-1 ml-2 cursor-pointer"
                      >
                        <BookmarkPlus className="w-3 h-3" /> Save Flashcard
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Bottom Input Box */}
        <div className="sticky bottom-0 glass-panel p-2.5 rounded-2xl border border-white/5 shadow-2xl flex items-center gap-2 z-10">
          <button
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Attach Document Reference"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask TeachMe AI a question about your physics or chemistry notes..."
            className="flex-1 bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none px-2 font-sans"
          />

          <button
            onClick={handleSend}
            disabled={!inputQuery.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white flex items-center justify-center transition-all orange-glow disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Sidebar - Citation Canvas */}
      {citations.length > 0 && (
        <aside className="w-80 flex-shrink-0 flex flex-col bg-[#0D0D17]/85 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden p-4 relative z-10 shadow-2xl">
          <div className="glow-ambient-cyan top-0 right-0" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase font-heading flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Quote className="w-4 h-4 text-[#06B6D4]" />
            <span>Citation Canvas</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {citations.map((c) => (
              <button
                key={c.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#06B6D4]/30 hover:bg-white/10 transition-all cursor-pointer group text-left w-full block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4]/50"
                onClick={() => {
                  setFlashcardModal({
                    open: true,
                    front: `Concept from ${c.documentName} (Page ${c.pageNumber})`,
                    back: c.quote,
                    deckName: 'Academic Review',
                  });
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="cyan">[{c.citationIndex}]</Badge>
                  <span className="text-[10px] text-[#94A3B8] font-mono truncate max-w-[150px]" title={c.documentName}>{c.documentName}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-4 italic group-hover:text-white transition-colors">
                  "{c.quote}"
                </p>
                <div className="mt-2 text-[10px] text-[#F97316] font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkPlus className="w-3 h-3" /> Convert to Flashcard
                </div>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Save Flashcard Modal */}
      {flashcardModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 shadow-2xl rounded-2xl relative overflow-hidden flex flex-col space-y-4">
            <div className="glow-ambient-orange top-[0px] left-[0px]" />
            
            <div className="flex items-center gap-2 text-white font-bold text-sm font-heading z-10">
              <BookmarkPlus className="w-5 h-5 text-[#F97316]" />
              <span>Save AI Highlight as Flashcard</span>
            </div>

            <div className="space-y-3.5 text-xs z-10">
              <div>
                <label htmlFor="deck-name-input" className="block text-[#94A3B8] font-semibold mb-1">Deck Name</label>
                <input
                  id="deck-name-input"
                  type="text"
                  value={flashcardModal.deckName}
                  onChange={(e) => setFlashcardModal((p) => ({ ...p, deckName: e.target.value }))}
                  className="w-full glass-input rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label htmlFor="front-prompt-input" className="block text-[#94A3B8] font-semibold mb-1">Front (Question / Prompt)</label>
                <input
                  id="front-prompt-input"
                  type="text"
                  value={flashcardModal.front}
                  onChange={(e) => setFlashcardModal((p) => ({ ...p, front: e.target.value }))}
                  className="w-full glass-input rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label htmlFor="back-answer-input" className="block text-[#94A3B8] font-semibold mb-1">Back (AI Response Answer)</label>
                <textarea
                  id="back-answer-input"
                  rows={4}
                  value={flashcardModal.back}
                  onChange={(e) => setFlashcardModal((p) => ({ ...p, back: e.target.value }))}
                  className="w-full glass-input rounded-xl p-2.5 text-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 z-10">
              <button
                onClick={() => setFlashcardModal({ open: false, front: '', back: '', deckName: 'General' })}
                className="bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlashcard}
                className="bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white text-xs px-5 py-2.5 rounded-xl font-bold orange-glow flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" /> Saved!
                  </>
                ) : (
                  'Save Flashcard'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
