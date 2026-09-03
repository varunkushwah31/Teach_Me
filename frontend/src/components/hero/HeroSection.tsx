import React, { useState } from 'react';
import {
  ArrowRightIcon,
  RobotIcon,
  SparkleIcon,
  StackIcon,
  CaretRightIcon,
  SpeakerHighIcon,
  CopyIcon,
  CheckIcon,
  PlayIcon,
  UploadSimpleIcon,
  BookOpenIcon,
  QuestionIcon,
  BrainIcon,
  KeyIcon,
  FilePdfIcon,
  LightningIcon,
  ShieldCheckIcon
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
    label: 'PDF Ingestion & RAG',
    icon: <BookOpenIcon className="w-3.5 h-3.5" />,
    iconColor: '#a8ff53',
    subject: 'Molecular Biology & Genetics',
    title: 'Instant Semantic Chunking & PgVector Search over Textbooks',
    description: 'Upload 100+ page textbook PDFs. TeachMe breaks chapters into 512-token semantic chunks in PgVector, enabling sub-50ms conceptual retrieval for every question you ask.',
    badge: 'PgVector HNSW',
    preview: `// Ingestion Pipeline: Cellular_Respiration_Ch4.pdf
[Ingestion Engine] File Size: 4.8 MB • 64 Pages Analyzed
[PgVector Store] Chunked into 48 semantic blocks (HNSW cosine index)
[Extracted Topics] Glycolysis, Pyruvate Decarboxylation, Citric Acid Cycle, Oxidative Phosphorylation, ATP Synthase
[Status] READY FOR ACTIVE RECALL, AUTO-QUIZZES & FLASHCARDS`
  },
  {
    id: 'tutor-qa',
    label: 'AI Tutor Q&A',
    icon: <RobotIcon className="w-3.5 h-3.5" />,
    iconColor: '#9c9af2',
    subject: 'Organic Chemistry II',
    title: 'Plain-English Explanations with Verifiable Chapter Footnotes',
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
    label: 'Diagnostic Quizzes',
    icon: <QuestionIcon className="w-3.5 h-3.5" />,
    iconColor: '#fa3abf',
    subject: 'Algorithms & Data Structures',
    title: 'Bloom-Aligned 5-Question Diagnostic Multiple Choice Tests',
    description: 'Test your understanding before exam day. TeachMe drafts challenging diagnostic multiple-choice questions directly from your notes with instant grading and detailed answer rationales.',
    badge: 'Bloom Taxonomy',
    preview: `[Practice Quiz: Graph Algorithms & Dynamic Programming]
Pass Score Target: 80% • 5 Multiple Choice Questions

Question 1: What is the time complexity of Dijkstra's algorithm using a Min-Heap for a graph G=(V, E)?
[A] O(V^2)
[B] O((V + E) log V)  ✓ (Correct! Extract-min takes O(log V) per vertex and edge relaxation)
[C] O(V * E)
[D] O(E log E)

Rationale: Cites Introduction to Algorithms (CLRS), Chapter 24, p. 658.`
  },
  {
    id: 'sm2-flashcards',
    label: 'SM-2 Flashcards',
    icon: <StackIcon className="w-3.5 h-3.5" />,
    iconColor: '#afec73',
    subject: 'Cognitive Neuroscience',
    title: 'Adaptive Spaced Repetition Memory with 1-Click Anki Sync',
    description: 'Never forget key formulas or definitions. TeachMe turns your highlighted study concepts into SM-2 flashcard decks that adapt review intervals based on how easily you recall each item.',
    badge: 'SM-2 Algorithm',
    preview: `[SM-2 Spaced Repetition Review Deck: Neural Synapses]
Card 3 of 28:
FRONT: "What is Long-Term Potentiation (LTP) and which receptor triggers calcium influx?"
BACK:  "LTP is the persistent strengthening of synapses based on recent patterns of activity. It requires NMDA receptor activation, allowing Ca2+ entry once Mg2+ is dislodged by depolarization."

Recall Quality: [0: Blackout] [1: Hard] [2: Moderate] [3: Good] [4: Easy] [5: Perfect]
-> Rated 4: Next review scheduled in 6 days (Ease Factor: 2.60)`
  },
  {
    id: 'summaries',
    label: 'Map-Reduce Summaries',
    icon: <SparkleIcon className="w-3.5 h-3.5" />,
    iconColor: '#d9f07c',
    subject: 'Constitutional Law',
    title: '1-Click Map-Reduce Summaries for 100+ Page Case Books',
    description: 'Stop drowning in hundreds of reading pages. TeachMe summarizes lengthy course chapters into structured 300-word briefs retaining all legal precedents, dates, and core doctrines.',
    badge: 'Map-Reduce Pipeline',
    preview: `[Executive Chapter Brief: 14th Amendment Due Process & Equal Protection]
Word Count: 285 words • Source: 54 pages (28 Chunks Analyzed)

Core Doctrines:
1. Strict Scrutiny: Applied to suspect classifications (race, national origin) requiring a compelling state interest.
2. Intermediate Scrutiny: Applied to gender classifications requiring an important government objective.
3. Rational Basis: Default test for economic regulations requiring legitimate state interest.

Key Case Precedents: Brown v. Board (1954), Loving v. Virginia (1967), Obergefell v. Hodges (2015).`
  },
  {
    id: 'podcasts',
    label: '2-Speaker Podcasts',
    icon: <SpeakerHighIcon className="w-3.5 h-3.5" />,
    iconColor: '#7655fd',
    subject: 'Astrophysics & Relativity',
    title: 'NotebookLM-Style 2-Speaker AI Study Podcast Episodes',
    description: 'Commute and study at the same time. TeachMe converts textbook chapters into engaging conversational study episodes between Alex and Maya with real browser voice audio narration.',
    badge: 'TTS Dialogue Engine',
    preview: `[AI Study Podcast Episode: General Relativity & Gravitational Waves]
Duration: 8 mins • Hosts: Alex & Maya

[Alex]: "Welcome back! Today we are tackling Einstein's General Relativity. Maya, what's the simplest way to visualize spacetime curvature?"
[Maya]: "Think of spacetime as a heavy trampoline. Place a bowling ball—that's our Sun—and it creates a deep well. Smaller marbles—like Earth—follow that curvature!"
[Alex]: "And when two black holes merge, they send actual ripples through that fabric: gravitational waves detected by LIGO!"`
  }
];

function mapTabToStudioTab(tabId: string): string {
  switch (tabId) {
    case 'pdf-rag':
      return 'documents';
    case 'practice-quizzes':
      return 'quiz';
    case 'sm2-flashcards':
      return 'flashcards';
    case 'summaries':
      return 'summarizer';
    case 'podcasts':
      return 'podcast';
    default:
      return 'chat';
  }
}

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
    <section className="relative pt-28 pb-20 overflow-hidden font-['Inter']">
      {/* Dynamic ambient lighting & glow orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-180 sm:w-220 h-96 bg-[#a8ff53]/10 blur-[130px] pointer-events-none rounded-full animate-pulse-slow" />
      <div className="absolute top-48 left-1/4 w-120 h-72 bg-[#7655fd]/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-36 right-1/4 w-96 h-64 bg-[#fa3abf]/8 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-310 mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Floating Announcement Badge */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#2e3238] hover:border-[#a8ff53]/50 bg-[#121317]/90 text-[#e5e7eb] text-[13px] transition-all hover:bg-[#15171c] hover:shadow-[0_0_20px_rgba(168,255,83,0.15)] cursor-pointer card-hover-lift"
          >
            <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
            <span className="font-medium">Transform any course PDF into active recall quizzes & flashcards</span>
            <CaretRightIcon className="w-3.5 h-3.5 text-[#a0a4af] transition-transform group-hover:translate-x-1 group-hover:text-[#a8ff53]" />
          </button>
        </div>

        {/* Billboard Headline */}
        <div className="text-center max-w-240 mx-auto mb-6">
          <h1 className="font-bold text-[38px] sm:text-[54px] md:text-[64px] leading-[1.08] tracking-tight text-[#f3f4f6]">
            Turn Any Textbook or PDF into Your{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#a8ff53]">
              Personal AI Tutor
            </span>
          </h1>
        </div>

        {/* Subtitle with improved readability */}
        <div className="text-center max-w-180 mx-auto mb-8">
          <p className="font-normal text-[16px] sm:text-[18px] leading-[1.6] text-[#b5b8c0]">
            Upload your syllabus or lecture slides. TeachMe uses <span className="text-[#f3f4f6] font-medium">PostgreSQL PgVector</span> and <span className="text-[#a8ff53] font-medium">Local Ollama</span> (or your custom API keys) to deliver step-by-step answers, diagnostic quizzes, SM-2 flashcards, and 2-speaker audio podcasts.
          </p>
        </div>

        {/* Action Buttons & Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-[#a8ff53] hover:bg-[#baff6b] active:scale-[0.98] text-[#121317] font-semibold text-[15px] rounded shadow-[0_0_25px_rgba(168,255,83,0.25)] transition-all cursor-pointer"
          >
            <UploadSimpleIcon className="w-4 h-4 text-[#121317]" weight="bold" />
            <span>Upload PDF & Study Now</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>

          <button
            onClick={() => onOpenStudio?.('chat')}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#121317] hover:bg-[#191c22] border border-[#2e3238] hover:border-[#a8ff53]/40 text-[#f3f4f6] text-[14.5px] font-medium rounded transition-all cursor-pointer shadow-lg"
          >
            <BrainIcon className="w-4 h-4 text-[#a8ff53]" />
            <span>Launch AI Studio</span>
          </button>

          <button
            onClick={() => {
              if (onOpenApiKeySettings) {
                onOpenApiKeySettings();
              } else {
                onOpenStudio?.('settings');
              }
            }}
            className="flex items-center gap-2 px-4 py-3.5 hover:bg-[#15171c] active:bg-[#1a1d22] border border-[#2e3238] hover:border-[#9c9af2]/60 text-[#d7d9dd] text-[14px] rounded transition-all cursor-pointer group"
          >
            <KeyIcon className="w-4 h-4 text-[#9c9af2] group-hover:rotate-12 transition-transform" weight="bold" />
            <span>AI Config & Keys</span>
          </button>
        </div>

        {/* Feature Highlights Strip (3 Pills) */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap mb-10 text-[13px] text-[#a0a4af]">
          <div className="flex items-center gap-1.5">
            <LightningIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
            <span>Sub-50ms Vector Retrieval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheckIcon className="w-4 h-4 text-[#9c9af2]" weight="fill" />
            <span>100% Private Local Ollama</span>
          </div>
          <div className="flex items-center gap-1.5">
            <SparkleIcon className="w-4 h-4 text-[#fa3abf]" weight="fill" />
            <span>Zero Hallucination Citations</span>
          </div>
        </div>

        {/* 6 Study Feature Tabs Bar — Lively interactive pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-4 max-w-280 mx-auto">
          {FEATURE_TABS.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-[13.5px] font-medium transition-all cursor-pointer card-hover-lift ${
                  isActive
                    ? 'bg-[#121317] border-2 border-[#a8ff53] text-[#f3f4f6] shadow-[0_0_20px_rgba(168,255,83,0.18)]'
                    : 'bg-[#121317]/70 border border-[#2e3238] text-[#a0a4af] hover:text-[#f3f4f6] hover:border-[#424750]'
                }`}
              >
                <span style={{ color: tab.iconColor }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Subject Preview Terminal with Smooth Tab Transition */}
        <div className="bg-[#121317] border border-[#2e3238] rounded shadow-2xl overflow-hidden max-w-280 mx-auto animate-slide-up">
          
          {/* Terminal Title Bar */}
          <div className="px-4 py-3 bg-[#15171c] border-b border-[#2e3238] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#d9f07c]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#a8ff53]" />
              </div>
              <span className="text-[#a0a4af] font-mono text-[12px] border-l border-[#2e3238] pl-3">
                session: {activeTab.subject}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 bg-[#1c1e21] text-[#a8ff53] font-mono rounded border border-[#2e3238]">
                {activeTab.badge}
              </span>
              <button
                onClick={() => handleCopy(activeTab.preview)}
                className="p-1.5 text-[#a0a4af] hover:text-[#f3f4f6] rounded hover:bg-[#272a2e] transition-colors cursor-pointer"
                title="Copy sample content"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-[#a8ff53]" weight="bold" /> : <CopyIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Content Split: Feature Details + Real Study Sample */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#2e3238]">
            
            {/* Left Narrative Pane */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ backgroundColor: activeTab.iconColor }}
                  />
                  <span className="text-[11.5px] font-mono text-[#a0a4af] uppercase tracking-wider">
                    {activeTab.subject}
                  </span>
                </div>
                
                <h3 className="font-semibold text-[20px] leading-[1.3] text-[#f3f4f6]">
                  {activeTab.title}
                </h3>

                <p className="text-[14px] leading-[1.65] text-[#b5b8c0]">
                  {activeTab.description}
                </p>
              </div>

              {/* Action Buttons & Dropzone trigger */}
              <div className="pt-4 border-t border-[#2e3238] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] font-mono text-[#a0a4af]">
                  <FilePdfIcon className="w-4 h-4 text-[#a8ff53]" />
                  <span>PDF Ready</span>
                </div>
                <button
                  onClick={() => onOpenStudio?.(mapTabToStudioTab(activeTab.id))}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#272a2e] hover:bg-[#343840] text-[#a8ff53] text-[13px] font-medium rounded transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(168,255,83,0.15)]"
                >
                  <PlayIcon className="w-3 h-3 fill-current" />
                  <span>Try in Studio</span>
                </button>
              </div>
            </div>

            {/* Right Realistic Study Preview Pane */}
            <div className="lg:col-span-7 bg-[#121317] p-5 overflow-x-auto font-mono text-[13px] leading-[1.7]">
              <pre className="text-[#e5e7eb] whitespace-pre-wrap">
                <code>{activeTab.preview}</code>
              </pre>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

