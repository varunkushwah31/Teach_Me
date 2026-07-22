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
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto relative">
      {/* Header Banner */}
      <div className="pb-3 border-b border-[#27272A] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>How can I help you study today?</span>
            <Badge variant="cyan">RRF Hybrid Search</Badge>
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Ask questions with verified citations from your vector store.
          </p>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#27272A] text-white border border-[#3F3F46]'
                    : 'bg-[#F97316] text-white orange-glow'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className="space-y-1 group">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#1A1A1A] border border-[#27272A] text-white rounded-tr-none'
                      : 'bg-[#1A1A1A]/60 border border-[#27272A] text-[#A1A1AA] rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-xs text-white max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text || (isStreaming ? 'Thinking & searching vector store...' : '')}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Message Meta & Actions */}
                <div className="flex items-center gap-2 px-1 text-[10px] text-[#A1A1AA] font-mono">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#F97316] hover:underline flex items-center gap-1 ml-2"
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

      {/* Citations Footnote Bar */}
      {citations.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#27272A] rounded-xl p-3 mb-3 flex items-center gap-3 overflow-x-auto text-xs font-mono">
          <span className="text-[#06B6D4] font-semibold flex items-center gap-1 flex-shrink-0">
            <Quote className="w-3.5 h-3.5" /> Source Citations:
          </span>
          <div className="flex items-center gap-2">
            {citations.map((c) => (
              <span
                key={c.id}
                title={c.quote}
                className="bg-[#0F0F0F] border border-[#27272A] text-[#A1A1AA] px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap"
              >
                [{c.citationIndex}] <span className="text-white font-medium">{c.documentName}</span> (p. {c.pageNumber})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Floating Bottom Glassmorphic Input Box */}
      <div className="sticky bottom-0 glass-panel p-2.5 rounded-2xl border border-[#27272A] shadow-2xl flex items-center gap-2">
        <button
          className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
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
          className="flex-1 bg-transparent text-xs text-white placeholder-[#A1A1AA] focus:outline-none px-2 font-sans"
        />

        <button
          onClick={handleSend}
          disabled={!inputQuery.trim() || isStreaming}
          className="w-9 h-9 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center transition-all orange-glow disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Save Flashcard Modal */}
      {flashcardModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#27272A] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <BookmarkPlus className="w-5 h-5 text-[#F97316]" />
              <span>Save AI Highlight as Flashcard</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="deck-name-input" className="block text-[#A1A1AA] mb-1">Deck Name</label>
                <input
                  id="deck-name-input"
                  type="text"
                  value={flashcardModal.deckName}
                  onChange={(e) => setFlashcardModal((p) => ({ ...p, deckName: e.target.value }))}
                  className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label htmlFor="front-prompt-input" className="block text-[#A1A1AA] mb-1">Front (Question / Prompt)</label>
                <input
                  id="front-prompt-input"
                  type="text"
                  value={flashcardModal.front}
                  onChange={(e) => setFlashcardModal((p) => ({ ...p, front: e.target.value }))}
                  className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label htmlFor="back-answer-input" className="block text-[#A1A1AA] mb-1">Back (AI Response Answer)</label>
                <textarea
                  id="back-answer-input"
                  rows={4}
                  value={flashcardModal.back}
                  onChange={(e) => setFlashcardModal((p) => ({ ...p, back: e.target.value }))}
                  className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFlashcardModal({ open: false, front: '', back: '', deckName: 'General' })}
                className="bg-[#27272A] text-white text-xs px-3 py-1.5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlashcard}
                className="bg-[#F97316] text-white text-xs px-4 py-1.5 rounded-lg font-medium orange-glow flex items-center gap-1"
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
