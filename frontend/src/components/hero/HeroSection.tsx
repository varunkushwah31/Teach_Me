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
    label: 'College Notes Ingestion & RAG',
    icon: <BookOpenIcon className="w-3.5 h-3.5" />,
    iconColor: '#a8ff53',
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
    icon: <RobotIcon className="w-3.5 h-3.5" />,
    iconColor: '#9c9af2',
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
    icon: <QuestionIcon className="w-3.5 h-3.5" />,
    iconColor: '#fa3abf',
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
    icon: <StackIcon className="w-3.5 h-3.5" />,
    iconColor: '#afec73',
    subject: 'Cognitive Neuroscience (NEUR301)',
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
    subject: 'Constitutional Law (LAW101)',
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
    label: '2-Speaker Review Podcasts',
    icon: <SpeakerHighIcon className="w-3.5 h-3.5" />,
    iconColor: '#7655fd',
    subject: 'Astrophysics & Relativity (PHYS202)',
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
            <span className="font-medium">College Notes PDF Chatbot with RAG & Verifiable Citations</span>
            <CaretRightIcon className="w-3.5 h-3.5 text-[#a0a4af] transition-transform group-hover:translate-x-1 group-hover:text-[#a8ff53]" />
          </button>
        </div>

        {/* Billboard Headline */}
        <div className="text-center max-w-240 mx-auto mb-6">
          <h1 className="font-bold text-[38px] sm:text-[54px] md:text-[64px] leading-[1.08] tracking-tight text-[#f3f4f6]">
            College Notes PDF Chatbot with{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f3f4f6] via-[#e5e7eb] to-[#a8ff53]">
              RAG & Citations
            </span>
          </h1>
        </div>

        {/* Subtitle with improved readability */}
        <div className="text-center max-w-180 mx-auto mb-8">
          <p className="font-normal text-[16px] sm:text-[18px] leading-[1.6] text-[#b5b8c0]">
            Upload your college lecture notes, syllabi, and textbook PDFs. TeachMe uses <span className="text-[#f3f4f6] font-medium">PostgreSQL PgVector</span> and <span className="text-[#a8ff53] font-medium">Spring AI</span> to deliver instant grounded answers with exact chapter and page citations, auto-generated exam quizzes, and SM-2 flashcards.
          </p>
        </div>

        {/* Action Buttons & Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-[#a8ff53] hover:bg-[#baff6b] active:scale-[0.98] text-[#121317] font-semibold text-[15px] rounded shadow-[0_0_25px_rgba(168,255,83,0.25)] transition-all cursor-pointer"
          >
            <UploadSimpleIcon className="w-4 h-4 text-[#121317]" weight="bold" />
            <span>Upload Notes PDF</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>

          <button
            onClick={() => onOpenStudio?.('chat')}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#121317] hover:bg-[#191c22] border border-[#2e3238] hover:border-[#a8ff53]/40 text-[#f3f4f6] text-[14.5px] font-medium rounded transition-all cursor-pointer shadow-lg"
          >
            <BrainIcon className="w-4 h-4 text-[#a8ff53]" />
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
            className="flex items-center gap-2 px-4 py-3.5 hover:bg-[#15171c] active:bg-[#1a1d22] border border-[#2e3238] hover:border-[#9c9af2]/60 text-[#d7d9dd] text-[14px] rounded transition-all cursor-pointer group"
          >
            <KeyIcon className="w-4 h-4 text-[#9c9af2] group-hover:scale-110 transition-transform" />
            <span>AI Provider Settings</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-[12.5px] text-[#b5b8c0] mb-12">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
            <span>100% Private Local Ollama Option</span>
          </div>
          <div className="flex items-center gap-2">
            <LightningIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
            <span>Sub-50ms PgVector Cosine Retrieval</span>
          </div>
          <div className="flex items-center gap-2">
            <FilePdfIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
            <span>Verifiable Page & Chapter Footnotes</span>
          </div>
        </div>

        {/* Interactive Interactive Preview Terminal */}
        <div className="bg-[#121317] border border-[#2e3238] rounded shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Top Engine Selector Strip */}
          <div className="flex items-center justify-between border-b border-[#2e3238] bg-[#15171c] px-4 py-2.5 overflow-x-auto scrollbar-none gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {FEATURE_TABS.map((tab) => {
                const isSelected = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-[12.5px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1e21] text-[#f3f4f6] border border-[#424750] shadow-sm'
                        : 'text-[#878c99] hover:text-[#d7d9dd] hover:bg-[#1c1e21]/50'
                    }`}
                  >
                    <span style={{ color: tab.iconColor }}>{tab.icon}</span>
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onOpenStudio?.(mapTabToStudioTab(activeTabId))}
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-mono text-[#a8ff53] hover:underline cursor-pointer shrink-0"
            >
              <span>Test in Studio</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Terminal Content Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Feature Context & Explanations */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#1c1e21] border border-[#2e3238] text-[11px] font-mono text-[#a8ff53]">
                  {activeTab.badge}
                </span>
                <span className="text-[12px] font-mono text-[#878c99]">
                  {activeTab.subject}
                </span>
              </div>

              <h2 className="font-bold text-[22px] sm:text-[24px] text-[#f3f4f6] leading-[1.25]">
                {activeTab.title}
              </h2>

              <p className="text-[14px] leading-[1.65] text-[#b5b8c0]">
                {activeTab.description}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onOpenStudio?.(mapTabToStudioTab(activeTabId))}
                  className="px-4 py-2 bg-[#272a2e] hover:bg-[#34383d] text-[#f3f4f6] text-[13px] font-semibold rounded transition-colors cursor-pointer flex items-center gap-2 border border-[#424750]"
                >
                  <PlayIcon className="w-3.5 h-3.5 fill-current text-[#a8ff53]" />
                  <span>Interactive Live Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column: Code & Execution Output Terminal */}
            <div className="lg:col-span-7 bg-[#1c1e21] border border-[#2e3238] rounded p-4 font-mono text-[12.5px] text-[#e5e7eb] relative group">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#272a2e]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80" />
                  <span className="ml-2 text-[11px] text-[#878c99]">teachme-terminal-preview</span>
                </div>

                <button
                  onClick={() => handleCopy(activeTab.preview)}
                  className="p-1 text-[#878c99] hover:text-[#f3f4f6] rounded hover:bg-[#272a2e] transition-colors cursor-pointer"
                  title="Copy terminal contents"
                >
                  {copied ? <CheckIcon className="w-3.5 h-3.5 text-[#a8ff53]" /> : <CopyIcon className="w-3.5 h-3.5" />}
                </button>
              </div>

              <pre className="whitespace-pre-wrap leading-[1.7] text-[#d7d9dd] overflow-x-auto selection:bg-[#a8ff53] selection:text-[#121317]">
                {activeTab.preview}
              </pre>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
