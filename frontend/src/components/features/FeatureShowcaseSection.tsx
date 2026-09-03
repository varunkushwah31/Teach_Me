import React, { useState, useEffect } from 'react';
import {
  RobotIcon,
  QuestionIcon,
  StackIcon,
  SpeakerHighIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  SparkleIcon,
  XCircleIcon,
  BookOpenIcon
} from '@phosphor-icons/react';

interface FeatureShowcaseSectionProps {
  onOpenStudio?: (initialTab?: string) => void;
}

const SAMPLE_TUTOR_PROMPTS: Record<string, { answer: string; citation: string }> = {
  'Why does SN2 invert stereochemistry?': {
    answer: 'In an SN2 mechanism, the incoming nucleophile attacks the electrophilic carbon exactly 180° opposite the leaving group. As the new bond forms, the three non-reacting substituents flip like an umbrella in a gust of wind—resulting in complete Walden inversion at chiral centers.',
    citation: 'Organic Chemistry (8th Ed), Chapter 6: Alkyl Halides, p. 218 [Chunk #14, Cosine: 0.96]'
  },
  'How does ATP Synthase generate ATP?': {
    answer: 'ATP Synthase functions as a molecular rotary motor. The steep electrochemical proton gradient (proton motive force) across the inner mitochondrial membrane drives rotation of the c-ring subunit, mechanically forcing ADP and inorganic phosphate together into ATP.',
    citation: 'Cellular Respiration (Ch. 4), p. 94 [Chunk #48, Cosine: 0.97]'
  },
  'What is Dijkstra vs A* Search?': {
    answer: 'Dijkstra explores paths uniformly in all directions based solely on the known distance g(n). A* Search optimizes this by incorporating an admissible heuristic h(n), estimating the remaining cost to the target and dramatically pruning search spaces.',
    citation: 'Algorithms & Data Structures (CLRS), Ch. 24, p. 658 [Chunk #09, Cosine: 0.94]'
  }
};

const SAMPLE_QUIZ = {
  question: 'What is the primary role of PgVector in Spring AI?',
  options: [
    { text: 'A. Store high-dimensional vector embeddings for cosine similarity queries', correct: true },
    { text: 'B. Compile TypeScript components directly into WebAssembly', correct: false },
    { text: 'C. Handle long-running HTTP timeouts for React clients', correct: false },
    { text: 'D. Manage transactional locks for distributed file uploads', correct: false }
  ],
  explanation: 'PgVector enables PostgreSQL to index and query high-dimensional vector embeddings natively with HNSW indexing at sub-50ms latency.'
};

const SAMPLE_FLASHCARD = {
  front: 'What does the Ease Factor (EF) represent in the SM-2 algorithm, and what is its minimum boundary?',
  back: 'The Ease Factor (EF) reflects the difficulty of recalling a flashcard. It is updated based on user recall grade q in [0, 5]. In TeachMe, EF is strictly clamped to a minimum of 1.3 to avoid infinite rapid review loops for difficult concepts.',
  deck: 'Cognitive Memory Systems',
  defaultEF: 2.50
};

const PODCAST_DIALOGUE = [
  { speaker: 'Alex', text: "Welcome back to TeachMe Deep Dives! Today Maya and I are breaking down how Spring AI pairs with PostgreSQL PgVector." },
  { speaker: 'Maya', text: "What strikes me most is how Map-Reduce summarization handles massive hundred-page textbooks without blowing context limits." },
  { speaker: 'Alex', text: "Exactly. The parallel MAP workers extract chapter insights in seconds, and REDUCE turns them into a clean 300-word brief." },
  { speaker: 'Maya', text: "And with the SM-2 algorithm integrated, students automatically get spaced repetition flashcards right after reviewing!" }
];

export const FeatureShowcaseSection: React.FC<FeatureShowcaseSectionProps> = ({ onOpenStudio }) => {
  const [activeEngine, setActiveEngine] = useState<'tutor' | 'quiz' | 'flashcard' | 'podcast'>('tutor');

  // AI Tutor Streaming State
  const [activeTutorPrompt, setActiveTutorPrompt] = useState('Why does SN2 invert stereochemistry?');
  const [typedOutput, setTypedOutput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcard 3D Flip State
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardRating, setCardRating] = useState<number | null>(null);
  const [calculatedEF, setCalculatedEF] = useState<number>(SAMPLE_FLASHCARD.defaultEF);

  // Podcast Audio Playback State
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState<number>(0);

  // Auto-stream effect for AI tutor preview
  useEffect(() => {
    if (activeEngine !== 'tutor') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTyping(true);
    setTypedOutput('');
    const fullText = SAMPLE_TUTOR_PROMPTS[activeTutorPrompt].answer;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= fullText.length) {
        setTypedOutput(fullText.slice(0, idx));
        idx += 3;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [activeTutorPrompt, activeEngine]);

  const handleSelectQuizOption = (idx: number) => {
    setSelectedOption(idx);
    setQuizSubmitted(true);
  };

  const handleRateFlashcard = (q: number) => {
    setCardRating(q);
    const newEF = Math.max(1.3, 2.5 + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    setCalculatedEF(newEF);
  };

  const handleTogglePodcast = () => {
    if (isPlayingPodcast) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingPodcast(false);
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlayingPodcast(!isPlayingPodcast);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingPodcast(true);
    let currentIdx = 0;

    const playDialogue = () => {
      if (currentIdx >= PODCAST_DIALOGUE.length) {
        setIsPlayingPodcast(false);
        setActiveSpeakerIdx(0);
        return;
      }

      const turn = PODCAST_DIALOGUE[currentIdx];
      setActiveSpeakerIdx(currentIdx);

      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = 1.05;
      utterance.pitch = turn.speaker === 'Alex' ? 0.95 : 1.25;

      utterance.onend = () => {
        currentIdx++;
        playDialogue();
      };
      utterance.onerror = () => {
        currentIdx++;
        playDialogue();
      };

      window.speechSynthesis.speak(utterance);
    };

    playDialogue();
  };

  return (
    <section id="study-tools" className="py-24 border-t border-[#2e3238] bg-[#1c1e21] font-['Inter']">
      <div className="max-w-310 mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-190 mb-12">
          <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-mono text-[13px] font-semibold mb-3">
            <SparkleIcon className="w-4 h-4" />
            <span>Interactive AI Study Laboratory</span>
          </div>

          <h2 className="font-bold text-[32px] sm:text-[42px] text-[#f3f4f6] mb-4 tracking-tight">
            Four Grounded Learning Engines for Complete Course Mastery
          </h2>

          <p className="text-[16px] text-[#b5b8c0] leading-[1.6]">
            Try each AI study engine live below. Every question, quiz, flashcard, and podcast is synthesized strictly from your uploaded textbook documents with verifiable chapter footnotes.
          </p>
        </div>

        {/* Feature Interactive Engine Selector Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-[#2e3238] pb-4">
          {[
            { id: 'tutor' as const, label: '1. AI Tutor Q&A & Citations', icon: <RobotIcon className="w-4 h-4 text-[#a8ff53]" />, activeBorder: 'border-[#a8ff53]', activeBg: 'bg-[#a8ff53]/10 text-[#a8ff53]' },
            { id: 'quiz' as const, label: '2. Diagnostic Auto-Quizzes', icon: <QuestionIcon className="w-4 h-4 text-[#fa3abf]" />, activeBorder: 'border-[#fa3abf]', activeBg: 'bg-[#fa3abf]/10 text-[#fa3abf]' },
            { id: 'flashcard' as const, label: '3. SM-2 Spaced Flashcards', icon: <StackIcon className="w-4 h-4 text-[#9c9af2]" />, activeBorder: 'border-[#9c9af2]', activeBg: 'bg-[#9c9af2]/10 text-[#9c9af2]' },
            { id: 'podcast' as const, label: '4. 2-Speaker AI Podcast', icon: <SpeakerHighIcon className="w-4 h-4 text-[#d9f07c]" />, activeBorder: 'border-[#d9f07c]', activeBg: 'bg-[#d9f07c]/10 text-[#d9f07c]' }
          ].map(tab => {
            const isActive = activeEngine === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveEngine(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded text-[14px] font-medium transition-all cursor-pointer card-hover-lift ${
                  isActive
                    ? `bg-[#121317] border-2 ${tab.activeBorder} text-[#f3f4f6] shadow-[0_0_20px_rgba(0,0,0,0.4)]`
                    : 'text-[#a0a4af] hover:text-[#f3f4f6] bg-[#121317]/50 hover:bg-[#121317] border border-[#2e3238]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Laboratory Window */}
        <div className="bg-[#121317] border border-[#2e3238] rounded p-6 sm:p-8 shadow-2xl animate-fade-in">
          
          {/* ENGINE 1: AI Tutor Q&A Streaming & Citations */}
          {activeEngine === 'tutor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-[12px] font-mono text-[#a8ff53] bg-[#a8ff53]/10 px-2.5 py-1 rounded inline-block border border-[#a8ff53]/20">
                  POST /api/chat/ask/stream • SSE Vector RAG
                </div>
                <h3 className="font-bold text-[24px] sm:text-[28px] text-[#f3f4f6] tracking-tight">
                  Realtime AI Tutor with Verifiable Citations
                </h3>
                <p className="text-[15px] text-[#b5b8c0] leading-[1.65]">
                  Stream explanations directly from course textbooks. Click any verified citation to jump straight to the source page and chunk in your document library.
                </p>
                <div className="space-y-2 pt-2 text-[13.5px] text-[#d7d9dd]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
                    <span>Sub-50ms token latency with Server-Sent Events (SSE)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
                    <span>PgVector cosine distance chunk matching (&lt; 0.35 threshold)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#a8ff53]" weight="fill" />
                    <span>Zero hallucination: answers restricted strictly to document context</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('chat')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[14px] rounded hover:bg-[#baff6b] transition-all cursor-pointer shadow-[0_0_15px_rgba(168,255,83,0.2)]"
                  >
                    <span>Launch AI Tutor in Studio</span>
                    <ArrowRightIcon className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>

              {/* Interactive Live Q&A Stream Simulator */}
              <div className="lg:col-span-7 bg-[#1c1e21] border border-[#2e3238] rounded p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div className="flex items-center gap-2 font-mono text-[12px] text-[#a0a4af]">
                    <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-ping" />
                    <span>Stream: tutor-qa.sse</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#121317] text-[#a8ff53] border border-[#2e3238]">
                    HNSW Cosine: 0.96
                  </span>
                </div>

                {/* Prompt selector pills */}
                <div className="flex items-center gap-2 flex-wrap text-[12px]">
                  <span className="text-[#a0a4af]">Test live prompt:</span>
                  {Object.keys(SAMPLE_TUTOR_PROMPTS).map((p) => (
                    <button
                      key={p}
                      onClick={() => setActiveTutorPrompt(p)}
                      className={`px-2.5 py-1 rounded border transition-colors cursor-pointer text-[12px] ${
                        activeTutorPrompt === p
                          ? 'bg-[#a8ff53] text-[#121317] font-semibold border-[#a8ff53]'
                          : 'bg-[#121317] border-[#2e3238] text-[#d7d9dd] hover:border-[#424750]'
                      }`}
                    >
                      {p.split(' ')[0]} {p.split(' ')[1]}...
                    </button>
                  ))}
                </div>

                {/* Stream Box */}
                <div className="p-4 bg-[#121317] border border-[#2e3238] rounded min-h-48 space-y-3">
                  <div className="text-[13px] font-semibold text-[#a8ff53] flex items-center gap-1.5 font-mono">
                    <RobotIcon className="w-4 h-4" />
                    <span>TeachMe AI Tutor Answer:</span>
                  </div>
                  <p className="text-[14px] leading-[1.65] text-[#f3f4f6] whitespace-pre-wrap">
                    {typedOutput}
                    {isTyping && <span className="inline-block w-2 h-4 bg-[#a8ff53] ml-1 animate-pulse" />}
                  </p>

                  {!isTyping && (
                    <div className="mt-3 pt-3 border-t border-[#2e3238] flex items-start gap-2 text-[12px] text-[#a0a4af]">
                      <BookOpenIcon className="w-4 h-4 text-[#a8ff53] shrink-0 mt-0.5" />
                      <span>{SAMPLE_TUTOR_PROMPTS[activeTutorPrompt].citation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ENGINE 2: Diagnostic Auto-Quiz */}
          {activeEngine === 'quiz' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-[12px] font-mono text-[#fa3abf] bg-[#fa3abf]/10 px-2.5 py-1 rounded inline-block border border-[#fa3abf]/20">
                  POST /api/quiz/generate/&#123;id&#125; • Bloom's Taxonomy
                </div>
                <h3 className="font-bold text-[24px] sm:text-[28px] text-[#f3f4f6] tracking-tight">
                  Automated 5-Question Diagnostic Quizzes
                </h3>
                <p className="text-[15px] text-[#b5b8c0] leading-[1.65]">
                  Select an answer on the right to see instant Bloom cognitive grading with complete pedagogical rationale explanations.
                </p>
                <div className="space-y-2 pt-2 text-[13.5px] text-[#d7d9dd]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#fa3abf]" weight="fill" />
                    <span>Calculates percentage score with 80% passing standard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#fa3abf]" weight="fill" />
                    <span>Detailed feedback explaining why distractors are wrong</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#fa3abf]" weight="fill" />
                    <span>Feeds directly into Exam Readiness score calculations</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('quiz')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[14px] rounded hover:bg-[#baff6b] transition-all cursor-pointer shadow-[0_0_15px_rgba(168,255,83,0.2)]"
                  >
                    <span>Generate Full Quiz in Studio</span>
                    <ArrowRightIcon className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>

              {/* Interactive Quiz Question Card */}
              <div className="lg:col-span-7 bg-[#1c1e21] border border-[#2e3238] rounded p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <span className="text-[12px] font-mono text-[#a0a4af]">Diagnostic Question 1 of 5</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#fa3abf]/10 text-[#fa3abf] border border-[#fa3abf]/20">
                    Pass Target: 80%
                  </span>
                </div>

                <div className="text-[16px] font-semibold text-[#f3f4f6]">
                  {SAMPLE_QUIZ.question}
                </div>

                <div className="space-y-2.5">
                  {SAMPLE_QUIZ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    let optionStyle = 'bg-[#121317] border-[#2e3238] text-[#d7d9dd] hover:border-[#424750]';
                    if (quizSubmitted && opt.correct) {
                      optionStyle = 'bg-[#a8ff53]/10 border-[#a8ff53] text-[#a8ff53] font-medium';
                    } else if (quizSubmitted && isSelected && !opt.correct) {
                      optionStyle = 'bg-[#f43f5e]/10 border-[#f43f5e] text-[#f43f5e] font-medium';
                    }

                    return (
                      <button
                        key={opt.text}
                        type="button"
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`w-full text-left p-3.5 rounded border transition-all flex items-center justify-between text-[13.5px] cursor-pointer ${optionStyle}`}
                      >
                        <span>{opt.text}</span>
                        {quizSubmitted && opt.correct && <CheckCircleIcon className="w-4 h-4 text-[#a8ff53] shrink-0" weight="fill" />}
                        {quizSubmitted && isSelected && !opt.correct && <XCircleIcon className="w-4 h-4 text-[#f43f5e] shrink-0" weight="fill" />}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3.5 bg-[#121317] border-l-4 border-[#a8ff53] rounded text-[13px] text-[#b5b8c0] animate-slide-up space-y-1">
                    <span className="text-[#a8ff53] font-semibold font-mono">Pedagogical Explanation:</span>
                    <p>{SAMPLE_QUIZ.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ENGINE 3: SM-2 Spaced Repetition Flashcards */}
          {activeEngine === 'flashcard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-[12px] font-mono text-[#9c9af2] bg-[#9c9af2]/10 px-2.5 py-1 rounded inline-block border border-[#9c9af2]/20">
                  POST /api/flashcards/&#123;id&#125;/review • SM-2 Algorithm
                </div>
                <h3 className="font-bold text-[24px] sm:text-[28px] text-[#f3f4f6] tracking-tight">
                  SuperMemo-2 (SM-2) Spaced Repetition
                </h3>
                <p className="text-[15px] text-[#b5b8c0] leading-[1.65]">
                  Click the 3D flashcard on the right to flip between Front and Back. Rate your recall from 0 to 5 to see the mathematical Ease Factor dynamically recalculate.
                </p>
                <div className="space-y-2 pt-2 text-[13.5px] text-[#d7d9dd]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#9c9af2]" weight="fill" />
                    <span>Clamps minimum Ease Factor to 1.3 to avoid recall burnout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#9c9af2]" weight="fill" />
                    <span>Exponential review interval expansion for grades &gt;= 3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#9c9af2]" weight="fill" />
                    <span>One-click export to Anki (.apkg / .txt) for mobile study</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('flashcards')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[14px] rounded hover:bg-[#baff6b] transition-all cursor-pointer shadow-[0_0_15px_rgba(168,255,83,0.2)]"
                  >
                    <span>Practice Flashcards in Studio</span>
                    <ArrowRightIcon className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>

              {/* Interactive 3D Flip Flashcard */}
              <div className="lg:col-span-7 bg-[#1c1e21] border border-[#2e3238] rounded p-6 text-center space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <span className="text-[12px] font-mono text-[#9c9af2]">Deck: {SAMPLE_FLASHCARD.deck}</span>
                  <span className="text-[11px] font-mono text-[#a0a4af] bg-[#121317] px-2 py-0.5 rounded border border-[#2e3238]">
                    Click card to flip
                  </span>
                </div>

                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="min-h-52 cursor-pointer perspective-1000 select-none"
                >
                  <div
                    className={`relative w-full h-52 transition-transform duration-500 transform-style-3d ${
                      isCardFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 bg-[#121317] border-2 border-[#2e3238] hover:border-[#9c9af2] rounded p-6 flex flex-col justify-between backface-hidden shadow-2xl transition-colors">
                      <div className="text-[11px] font-mono text-[#9c9af2] uppercase tracking-wider">
                        ✦ Front • Question
                      </div>
                      <div className="text-[16px] font-medium text-[#f3f4f6] leading-normal">
                        {SAMPLE_FLASHCARD.front}
                      </div>
                      <div className="text-[11px] text-[#a0a4af] font-mono">
                        (Click to reveal answer)
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 bg-[#15171c] border-2 border-[#9c9af2] rounded p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl">
                      <div className="text-[11px] font-mono text-[#a8ff53] uppercase tracking-wider">
                        ✓ Back • Verified Answer
                      </div>
                      <div className="text-[14px] text-[#e5e7eb] leading-[1.6]">
                        {SAMPLE_FLASHCARD.back}
                      </div>
                      <div className="text-[11px] text-[#a0a4af] font-mono">
                        (Click to flip back)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recall Quality Buttons */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-[12px] text-[#a0a4af] mr-1">Rate recall quality:</span>
                    {[0, 1, 2, 3, 4, 5].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleRateFlashcard(q)}
                        className={`w-9 h-9 rounded bg-[#121317] hover:bg-[#272a2e] border text-[13px] font-mono transition-all cursor-pointer ${
                          cardRating === q
                            ? 'border-[#9c9af2] text-[#9c9af2] font-bold bg-[#9c9af2]/10 shadow-[0_0_10px_rgba(156,154,242,0.3)]'
                            : 'border-[#2e3238] text-[#d7d9dd]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {cardRating !== null && (
                    <div className="text-[12px] font-mono text-[#a8ff53] animate-slide-up">
                      SM-2 Recalculated: Ease Factor = <span className="font-bold">{calculatedEF.toFixed(2)}</span> • Next review scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ENGINE 4: 2-Speaker Audio Podcast */}
          {activeEngine === 'podcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-[12px] font-mono text-[#d9f07c] bg-[#d9f07c]/10 px-2.5 py-1 rounded inline-block border border-[#d9f07c]/20">
                  POST /api/audio/generate-podcast/&#123;id&#125; • 2-Host TTS
                </div>
                <h3 className="font-bold text-[24px] sm:text-[28px] text-[#f3f4f6] tracking-tight">
                  NotebookLM-Style 2-Speaker Audio Podcast
                </h3>
                <p className="text-[15px] text-[#b5b8c0] leading-[1.65]">
                  Turn textbook chapters into natural conversational dialogue between Alex and Maya. Listen hands-free on commutes or while reviewing formulas.
                </p>
                <div className="space-y-2 pt-2 text-[13.5px] text-[#d7d9dd]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#d9f07c]" weight="fill" />
                    <span>Distinct vocal synthesis pitches for Host Alex and Host Maya</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#d9f07c]" weight="fill" />
                    <span>Conversational banter and analogies to clarify dry concepts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#d9f07c]" weight="fill" />
                    <span>Realtime speech synthesis synchronized with script highlights</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onOpenStudio?.('podcast')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[14px] rounded hover:bg-[#baff6b] transition-all cursor-pointer shadow-[0_0_15px_rgba(168,255,83,0.2)]"
                  >
                    <span>Generate Audio in Studio</span>
                    <ArrowRightIcon className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>

              {/* Interactive Audio Player & Soundwave Equalizer */}
              <div className="lg:col-span-7 bg-[#1c1e21] border border-[#2e3238] rounded p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <div className="text-[15px] font-semibold text-[#f3f4f6]">
                      Episode 1: Spring AI Vector Workflows & Learning Memory
                    </div>
                    <div className="text-[12px] text-[#a0a4af] font-mono">
                      Co-hosts: Alex & Maya • Duration: ~8 mins
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTogglePodcast}
                    className="p-3.5 rounded-full bg-[#a8ff53] text-[#121317] hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(168,255,83,0.3)]"
                  >
                    {isPlayingPodcast ? (
                      <PauseIcon className="w-5 h-5 fill-current" weight="fill" />
                    ) : (
                      <PlayIcon className="w-5 h-5 fill-current" weight="fill" />
                    )}
                  </button>
                </div>

                {/* Animated Soundwave Visualizer Bars */}
                <div className="flex items-center gap-1.5 h-14 bg-[#121317] p-3 rounded border border-[#2e3238]">
                  {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4].map((animIdx, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-200 ${
                        isPlayingPodcast
                          ? `bg-[#a8ff53] animate-equalizer-${animIdx}`
                          : 'bg-[#2e3238] h-3'
                      }`}
                    />
                  ))}
                </div>

                {/* Dialogue Transcript with Active Speaker Highlight */}
                <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                  {PODCAST_DIALOGUE.map((line, idx) => {
                    const isCurrentSpeaker = isPlayingPodcast && activeSpeakerIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded border text-[13px] leading-normal transition-all ${
                          isCurrentSpeaker
                            ? 'bg-[#121317] border-[#a8ff53] text-[#f3f4f6] shadow-[0_0_12px_rgba(168,255,83,0.15)]'
                            : 'bg-[#121317]/50 border-transparent text-[#a0a4af]'
                        }`}
                      >
                        <span className={`font-mono font-semibold mr-2 ${
                          line.speaker === 'Alex' ? 'text-[#a8ff53]' : 'text-[#9c9af2]'
                        }`}>
                          [{line.speaker}]:
                        </span>
                        <span>{line.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

