import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Paperclip, BookmarkPlus, Quote, Check, Bot, User, Filter, Layers, Clock, History, Sparkles, Copy, Mic, FileText, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { streamChatResponse, citationApi, flashcardApi, documentApi, chatHistoryApi } from '../lib/apiClient';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BatchSearchModal } from '../components/modals/BatchSearchModal';
import { AudioPodcastPlayerModal } from '../components/modals/AudioPodcastPlayerModal';

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

const toggleDocSelection = (docId: number, prev: number[]): number[] => {
  return prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId];
};

const STARTER_PROMPTS = [
  '💡 Explain Schrödinger equation using ELI5 analogies',
  '📐 Derive Born probability rule |Ψ(x,t)|²',
  '⚡ Summarize core principles of Quantum Physics Notes',
  '🧪 Generate 5-question multiple choice quiz on Chapter 2',
];

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your **TeachMe AI Academic Tutor**. Ask me questions about your uploaded lecture notes, textbook chapters, or physics equations. All answers cite verified source pages! **[1]**',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const [availableDocs, setAvailableDocs] = useState<{ id: number; originalFilename: string }[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Modals state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState<{ open: boolean; docId: number; docName: string }>({ open: false, docId: 1, docName: 'Quantum Physics Notes.pdf' });
  const [activeCitationModal, setActiveCitationModal] = useState<CitationItem | null>(null);

  // Recent chat history state (30 days / max 30)
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

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
    // Load available documents for filter scope
    documentApi.getHistory().then((res) => {
      if (res?.content) {
        setAvailableDocs(res.content.map((d: any) => ({ id: d.id, originalFilename: d.originalFilename })));
      }
    });

    // Load recent 30-day / 30-chat history
    chatHistoryApi.getRecentChats().then((data) => {
      if (Array.isArray(data)) setRecentChats(data);
    });
  }, []);

  useEffect(() => {
    // Load active citations for session
    citationApi.getByChat(selectedDocId).then((res) => {
      if (res && Array.isArray(res)) setCitations(res);
    });
  }, [selectedDocId]);

  const handleSend = (textToSend?: string) => {
    const queryText = textToSend || inputQuery;
    if (!queryText.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
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
        console.error('Chat stream error', err);
        setIsStreaming(false);
      },
      selectedDocIds
    );
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
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
      {/* Left Sidebar - Main Chat Workspace */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Workspace Header Banner */}
        <div className="pb-3 border-b border-white/5 flex items-center justify-between flex-shrink-0 mb-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-heading">
              <span>AI Tutor Chat</span>
              <Badge variant="cyan">Parent-Child RAG</Badge>
              <Badge variant="orange">30-Day Retention</Badge>
            </h1>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Ask questions with verified citations from your uploaded vector document store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <History className="w-4 h-4 text-[#F97316]" />
              <span>Recent Chats ({recentChats.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-1.5 bg-[#06B6D4]/10 border border-[#06B6D4]/30 hover:bg-[#06B6D4]/20 text-[#06B6D4] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer cyan-glow transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Batch Multi-Query Search</span>
            </button>
          </div>
        </div>

        {/* 30-Day History Drawer Overlay */}
        {showHistoryPanel && (
          <div className="mb-4 p-4 rounded-2xl bg-[#0D0D17] border border-[#F97316]/30 shadow-2xl space-y-3 font-mono text-xs z-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F97316]" />
                Recent 30-Day Chat History ({recentChats.length} saved)
              </span>
              <button
                type="button"
                onClick={() => setShowHistoryPanel(false)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#F97316]/40 cursor-pointer space-y-1 transition-all"
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      { id: `hist-q-${chat.id}`, sender: 'user', text: chat.question, timestamp: new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                      { id: `hist-a-${chat.id}`, sender: 'ai', text: chat.answer, timestamp: new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                    ]);
                    setShowHistoryPanel(false);
                  }}
                >
                  <p className="font-bold text-white truncate">{chat.question}</p>
                  <p className="text-[10px] text-[#94A3B8] font-sans truncate">{chat.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Document Filter Chips */}
        {availableDocs.length > 0 && (
          <div className="mb-3 p-2 rounded-xl bg-[#06060A]/80 border border-white/5 flex items-center gap-2 overflow-x-auto text-xs flex-shrink-0 scrollbar-none">
            <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-wider flex items-center gap-1 shrink-0 px-1 font-bold">
              <Filter className="w-3.5 h-3.5 text-[#F97316]" /> Target Scope:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDocIds([])}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                selectedDocIds.length === 0
                  ? 'bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white shadow-sm font-bold orange-glow'
                  : 'bg-white/5 text-[#94A3B8] hover:text-white border border-white/5'
              }`}
            >
              All Library Documents ({availableDocs.length})
            </button>
            {availableDocs.map((doc) => {
              const isChecked = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocIds((prev) => toggleDocSelection(doc.id, prev))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isChecked
                      ? 'border-[#06B6D4] bg-[#06B6D4]/20 text-white font-bold cyan-glow'
                      : 'border-white/5 bg-white/5 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-[#06B6D4]' : 'bg-[#94A3B8]'}`} />
                  <span className="truncate max-w-[140px]">{doc.originalFilename}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-3 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
                    isUser
                      ? 'bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] text-white cyan-glow'
                      : 'bg-gradient-to-br from-[#F97316] to-[#D946EF] text-white orange-glow'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2 group max-w-[88%]">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed transition-all shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-[#F97316]/15 to-[#D946EF]/10 border border-orange-500/30 text-white rounded-tr-none shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]'
                        : 'bg-[#0D0D17]/90 border border-white/10 text-[#F8FAFC] rounded-tl-none hover:border-white/20 backdrop-blur-xl'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                    ) : (
                      <div className="prose prose-invert prose-xs text-[#F8FAFC] max-w-none space-y-2 font-sans">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text || (isStreaming ? 'Searching vector chunks & generating answer...' : '')}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* AI Response Action Toolbar */}
                  <div className="flex items-center justify-between px-1 text-[10px] text-[#94A3B8] font-mono">
                    <span className="text-[10px]">{msg.timestamp}</span>

                    {!isUser && msg.text && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFlashcardModal({
                              open: true,
                              front: 'Key Quantum Concept Question',
                              back: msg.text.slice(0, 300),
                              deckName: 'Physics 101',
                            })
                          }
                          className="hover:text-[#F97316] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <BookmarkPlus className="w-3 h-3 text-[#F97316]" />
                          <span>Flashcard</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowAudioModal({ open: true, docId: 1, docName: 'Quantum Physics Notes.pdf' })}
                          className="hover:text-[#D946EF] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Mic className="w-3 h-3 text-[#D946EF]" />
                          <span>Podcast</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starter Prompts Bar */}
        {messages.length <= 3 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[#94A3B8] hover:text-white transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>{prompt}</span>
                <ChevronRight className="w-3 h-3 text-[#F97316]" />
              </button>
            ))}
          </div>
        )}

        {/* Floating Bottom Input Box */}
        <div className="sticky bottom-0 bg-[#0D0D17]/95 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 z-10">
          <button
            type="button"
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
            placeholder="Ask TeachMe AI a question about your physics notes, formulas, or proofs..."
            className="flex-1 bg-transparent text-xs text-white placeholder-[#94A3B8] focus:outline-none px-2 font-sans"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white flex items-center justify-center transition-all orange-glow disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Sidebar - Citation Canvas */}
      {citations.length > 0 && (
        <aside className="w-80 flex-shrink-0 flex flex-col bg-[#0D0D17]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden p-4 relative z-10 shadow-2xl">
          <div className="glow-ambient-cyan top-0 right-0" />
          <h2 className="text-xs font-bold text-white tracking-wide uppercase font-heading flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Quote className="w-4 h-4 text-[#06B6D4]" />
            <span>Citation Canvas ({citations.length})</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {citations.map((c) => (
              <button
                key={c.id}
                type="button"
                className="p-3.5 rounded-xl bg-[#06060A]/80 border border-white/5 hover:border-[#06B6D4]/40 hover:bg-white/5 transition-all cursor-pointer group text-left w-full block focus:outline-none"
                onClick={() => setActiveCitationModal(c)}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="cyan">[{c.citationIndex}]</Badge>
                  <span className="text-[10px] text-[#94A3B8] font-mono truncate max-w-[150px]" title={c.documentName}>{c.documentName}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-4 italic group-hover:text-white transition-colors">
                  "{c.quote}"
                </p>
                <div className="mt-2 text-[10px] text-[#F97316] font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <BookmarkPlus className="w-3 h-3" /> Preview Citation Quote
                </div>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Citation Preview Modal */}
      {activeCitationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card variant="default" className="max-w-md w-full p-6 space-y-4 relative border-[#06B6D4]/40 shadow-2xl bg-[#0D0D17]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">Citation [{activeCitationModal.citationIndex}]</Badge>
                <span className="text-xs font-bold text-white font-mono truncate max-w-[200px]">{activeCitationModal.documentName}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitationModal(null)}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#06060A]/90 border border-white/5 font-mono text-xs text-[#94A3B8] leading-relaxed italic">
              "{activeCitationModal.quote}"
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFlashcardModal({
                    open: true,
                    front: `Concept from ${activeCitationModal.documentName}`,
                    back: activeCitationModal.quote,
                    deckName: 'Academic Review',
                  });
                  setActiveCitationModal(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white text-xs font-bold rounded-xl orange-glow cursor-pointer flex items-center gap-1.5"
              >
                <BookmarkPlus className="w-4 h-4" /> Save as Flashcard
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Audio Podcast Player Modal */}
      {showAudioModal.open && (
        <AudioPodcastPlayerModal
          documentId={showAudioModal.docId}
          documentName={showAudioModal.docName}
          onClose={() => setShowAudioModal({ open: false, docId: 0, docName: '' })}
        />
      )}

      {/* Save Flashcard Modal (Radix Dialog) */}
      <Dialog.Root
        open={flashcardModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setFlashcardModal({ open: false, front: '', back: '', deckName: 'General' });
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full p-6 bg-[#0D0D17]/95 border border-white/5 shadow-2xl rounded-2xl overflow-hidden flex flex-col space-y-4 z-50 focus:outline-none">
            <div className="glow-ambient-orange top-[0px] left-[0px]" />
            
            <div className="flex items-center gap-2 text-white font-bold text-sm font-heading z-10">
              <BookmarkPlus className="w-5 h-5 text-[#F97316]" />
              <Dialog.Title className="text-white font-bold text-sm font-heading">
                Save AI Highlight as Flashcard
              </Dialog.Title>
            </div>

            <Dialog.Description className="text-xs text-[#94A3B8] z-10">
              Add details to save this citation context directly to your spaced repetition learning decks.
            </Dialog.Description>

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
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Batch Search Modal */}
      {showBatchModal && (
        <BatchSearchModal chatId={selectedDocId} onClose={() => setShowBatchModal(false)} />
      )}
    </div>
  );
};
