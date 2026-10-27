import React, { useState } from 'react';
import {
  ArrowRightIcon,
  CopyIcon,
  CheckIcon,
  UploadSimpleIcon,
  BookOpenIcon,
  QuestionIcon,
  BrainIcon,
  KeyIcon,
  StackIcon,
  SpeakerHighIcon,
  SparkleIcon
} from '@phosphor-icons/react';

interface HeroSectionProps {
  onOpenStudio?: (initialTab?: string) => void;
  onOpenApiKeySettings?: () => void;
}

interface FeatureTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconColor: string;
  subject: string;
  title: string;
  description: string;
  preview: string;
  badge: string;
}

const FEATURE_TABS: FeatureTab[] = [
  {
    id: 'pdf-rag',
    label: 'College Notes Ingestion & RAG',
    icon: <BookOpenIcon className="w-4 h-4" />,
    iconColor: '#6366f1',
    subject: 'Molecular Biology & Genetics (BIO101)',
    title: 'Instant Semantic Chunking & PgVector Search over College Notes',
    description: 'Upload 100+ page lecture slide and textbook PDFs. TeachMe breaks chapters into 512-token semantic chunks in PgVector, enabling sub-50ms conceptual retrieval for every question you ask.',
    badge: 'PgVector HNSW',
    preview: `// Ingestion Pipeline: Cellular_Respiration_Ch4.pdf
[Ingestion Engine] File Size: 4.8 MB • 64 Pages Analyzed
[PgVector Store] Chunked into 48 semantic blocks (HNSW cosine index)
[Extracted Topics] Glycolysis, Pyruvate Decarboxylation, Citric Acid Cycle, Oxidative Phosphorylation, ATP Synthase
[Status] READY FOR ACTIVE RECALL, AUTO-QUIZZES & FLASHCARDS`
  },
  {
    id: 'tutor-qa',
    label: 'College Notes RAG Chatbot',
    icon: <SparkleIcon className="w-4 h-4" />,
    iconColor: '#818cf8',
    subject: 'Organic Chemistry II (CHEM201)',
    title: 'Grounded Explanations with Verifiable Chapter & Page Footnotes',
    description: 'Ask complex follow-up questions on confusing lecture slides. TeachMe gives step-by-step analogies and cites the exact chapter and page numbers from your uploaded document.',
    badge: 'Verifiable Citations',
    preview: `Student: "Why does SN2 inversion of configuration occur at chiral centers?"

AI Tutor: "Great question! In an SN2 reaction (Substitution Nucleophilic Biomolecular), the nucleophile attacks the electrophilic carbon from the backside—180° opposite the leaving group.
As the new bond forms, the three non-reacting substituents flip like an umbrella in the wind (Walden Inversion).

Citations:
• Organic Chemistry (8th Ed), Chapter 6: Alkyl Halides, Page 218 [Chunk #14, Cosine: 0.96]"`
  },
  {
    id: 'practice-quizzes',
    label: 'Exam Diagnostic Quizzes',
    icon: <QuestionIcon className="w-4 h-4" />,
    iconColor: '#6366f1',
    subject: 'Algorithms & Data Structures (CS102)',
    title: 'Bloom-Aligned 5-Question Diagnostic Multiple Choice Tests',
    description: 'Test your understanding before exam day. TeachMe drafts challenging diagnostic multiple-choice questions directly from your notes with instant grading and detailed answer rationales.',
    badge: 'Bloom Taxonomy',
    preview: `[Practice Quiz: Graph Algorithms & Dynamic Programming]
Pass Score Target: 80% • 5 Multiple Choice Questions

Question 1: What is the time complexity of Dijkstra's algorithm using a Min-Heap for a graph G=(V, E)?
[A] O(V^2)
[B] O((V + E) log V)  (Correct! Extract-min takes O(log V) per vertex and edge relaxation)
[C] O(V * E)
[D] O(E log E)

Rationale: Cites Introduction to Algorithms (CLRS), Chapter 24, p. 658.`
  },
  {
    id: 'sm2-flashcards',
    label: 'Course SM-2 Flashcards',
    icon: <StackIcon className="w-4 h-4" />,
    iconColor: '#10b981',
    subject: 'Cognitive Neuroscience (NEUR301)',
    title: 'Adaptive Spaced Repetition Memory with 1-Click Anki Sync',
    description: 'Never forget key formulas or definitions. TeachMe turns your highlighted study concepts into SM-2 flashcard decks that adapt review intervals based on how easily you recall each item.',
    badge: 'SM-2 Algorithm',
    preview: `Deck: Cognitive Neuroscience (NEUR301) • 24 Cards Due
Algorithm: SuperMemo-2 (SM-2) Interval Expansion

Card #12:
Front: "What does the Ease Factor (EF) represent in the SM-2 algorithm?"
Back: "The Ease Factor reflects the difficulty of recalling a card. It is updated based on user recall grade q in [0, 5]. In TeachMe, EF is clamped to a minimum of 1.3."

Ease Factor: 2.50 | Interval: 6 Days | Repetitions: 2`
  },
  {
    id: 'audio-podcasts',
    label: '2-Speaker Audio Podcasts',
    icon: <SpeakerHighIcon className="w-4 h-4" />,
    iconColor: '#34d399',
    subject: 'Applied Microeconomics (ECON104)',
    title: 'NotebookLM-Style 2-Speaker Audio Study Podcasts',
    description: 'Convert dense lecture chapters into lively conversational audio discussions between Alex and Maya. Listen hands-free on your commute or during gym sessions.',
    badge: '2-Speaker TTS',
    preview: `[Episode: Oligopoly Models, Cournot Duopoly & Nash Equilibrium]
Co-hosts: Alex & Maya • Duration: 7 mins 45 secs

[Alex]: "Welcome back to TeachMe Deep Dives! Today Maya and I are breaking down how firms compete on quantities under Cournot competition."
[Maya]: "What makes Cournot fascinating is that each firm chooses its output treating the rival's output as fixed. The reaction curves intersect right at the Nash equilibrium!"
[Alex]: "Exactly. It lies right between monopoly deadweight loss and perfect competition pricing."`
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenStudio, onOpenApiKeySettings }) => {
  const [activeTabId, setActiveTabId] = useState('pdf-rag');
  const [copied, setCopied] = useState(false);

  const activeTab = FEATURE_TABS.find(t => t.id === activeTabId) || FEATURE_TABS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-28 pb-20 overflow-hidden font-sans bg-[#08090d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight text-white">
            College Notes PDF Chatbot with Grounded RAG &amp; Citations
          </h1>
        </div>

        {/* Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
            Upload your college lecture notes, syllabi, and textbook PDFs. TeachMe uses <span className="text-white font-medium">PostgreSQL PgVector</span> and <span className="text-indigo-400 font-medium">Spring AI</span> to deliver instant grounded answers with exact chapter and page citations, auto-generated exam quizzes, and SM-2 flashcards.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95 group"
          >
            <UploadSimpleIcon className="w-4 h-4 text-white" weight="bold" />
            <span>Upload Notes PDF</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" weight="bold" />
          </button>

          <button
            onClick={() => onOpenStudio?.('chat')}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#0e1017] hover:bg-[#141622] border border-[#1c1f2e] hover:border-indigo-500/40 text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <BrainIcon className="w-4 h-4 text-indigo-400" />
            <span>Open Notes Chatbot</span>
          </button>

          <button
            onClick={() => {
              if (onOpenApiKeySettings) {
                onOpenApiKeySettings();
              } else {
                onOpenStudio?.('settings');
              }
            }}
            className="flex items-center gap-2 px-4 py-3.5 bg-[#0e1017] hover:bg-[#141622] border border-[#1c1f2e] hover:border-indigo-500/40 text-zinc-300 text-xs sm:text-sm rounded-xl transition-all cursor-pointer font-semibold"
          >
            <KeyIcon className="w-4 h-4 text-indigo-400" />
            <span>Custom API Keys / Ollama</span>
          </button>
        </div>

        {/* Interactive Feature Terminal & Preview Box */}
        <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Feature Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#1c1f2e] scrollbar-none">
            {FEATURE_TABS.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                      : 'text-zinc-400 hover:text-white bg-[#141622] border border-[#1c1f2e]'
                  }`}
                >
                  <span style={{ color: isActive ? '#a5b4fc' : undefined }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Description & Terminal Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                {activeTab.badge}
              </span>

              <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight">
                {activeTab.title}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {activeTab.description}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onOpenStudio?.(activeTab.id === 'pdf-rag' ? 'documents' : activeTab.id === 'tutor-qa' ? 'chat' : activeTab.id === 'practice-quizzes' ? 'quiz' : activeTab.id === 'sm2-flashcards' ? 'flashcards' : 'podcast')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95"
                >
                  <span>Launch in Studio</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Preview Pane */}
            <div className="lg:col-span-7 bg-[#08090d] border border-[#1c1f2e] rounded-2xl p-5 shadow-xl font-mono text-xs relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c1f2e] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1c1f2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1c1f2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1c1f2e]" />
                  <span className="text-xs text-zinc-500 ml-2">{activeTab.subject}</span>
                </div>

                <button
                  onClick={() => handleCopy(activeTab.preview)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy preview text"
                >
                  {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="pt-4 text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-x-auto font-mono text-xs max-h-72">
                {activeTab.preview}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
