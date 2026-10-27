import React, { useState, useEffect } from 'react';
import {
  UploadSimpleIcon,
  FileTextIcon,
  CheckCircleIcon,
  SparkleIcon,
  StackIcon,
  QuestionIcon,
  ArrowRightIcon,
  ShareNetworkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  SpeakerHighIcon,
  BookOpenIcon,
  ArrowsClockwiseIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadSimpleIcon,
  SlidersIcon
} from '@phosphor-icons/react';
import { TeachMeAPI } from '../../services/teachMeService';
import { usePlayground } from '../../context/usePlayground';
import type {
  DocumentHistoryDTO,
  QuizDTO,
  FlashcardDTO,
  KnowledgeGraphDTO,
  StudyPlanDTO,
  NoteOutlineDTO,
  PodcastScriptDTO,
  SearchResultChunkDTO
} from '../../types/backend';

type ToolTab =
  | 'docs'
  | 'graph'
  | 'search'
  | 'quiz'
  | 'flashcards'
  | 'roadmap'
  | 'notes'
  | 'podcast'
  | 'summary';

export const KnowledgeView: React.FC = () => {
  const { activeDocId, setActiveDocId, setActiveTab } = usePlayground();
  const [documents, setDocuments] = useState<DocumentHistoryDTO[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolTab>('docs');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Tool 1: Quiz state
  const [quizData, setQuizData] = useState<QuizDTO | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Tool 2: Flashcards state
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Tool 3: Summary state
  const [summaryText, setSummaryText] = useState<string | null>(null);

  // Tool 4: Knowledge Graph state
  const [graphData, setGraphData] = useState<KnowledgeGraphDTO | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Tool 5: Hybrid Search state
  const [searchQuery, setSearchQuery] = useState('asymptotic bounds and recurrence');
  const [searchResults, setSearchResults] = useState<SearchResultChunkDTO[]>([]);
  const [searchAlpha, setSearchAlpha] = useState(0.7);
  const [isSearching, setIsSearching] = useState(false);

  // Tool 6: Study Roadmap state
  const [roadmapData, setRoadmapData] = useState<StudyPlanDTO | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  // Tool 7: Cornell Notes state
  const [notesData, setNotesData] = useState<NoteOutlineDTO | null>(null);

  // Tool 8: Podcast state
  const [podcastData, setPodcastData] = useState<PodcastScriptDTO | null>(null);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [activeSpeechIdx, setActiveSpeechIdx] = useState(0);

  // Initial document fetch
  const refreshDocuments = async () => {
    try {
      const res = await TeachMeAPI.documents.getHistory();
      setDocuments(res.content || []);
    } catch {
      // Keep existing list
    }
  };

  useEffect(() => {
    let ignore = false;
    TeachMeAPI.documents.getHistory()
      .then(res => {
        if (!ignore) {
          const list = res.content || [];
          setDocuments(list);
          if (list.length > 0 && !activeDocId) {
            setActiveDocId(list[0].id);
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          const demoList: DocumentHistoryDTO[] = [
            {
              id: 101,
              filename: 'CS106B_Lecture_Algorithms_Complexity.pdf',
              fileSize: 2450000,
              category: 'Computer Science',
              status: 'COMPLETED',
              createdAt: new Date().toISOString()
            },
            {
              id: 102,
              filename: 'Operating_Systems_Concurrency_Semaphores.pdf',
              fileSize: 1820000,
              category: 'Systems',
              status: 'COMPLETED',
              createdAt: new Date().toISOString()
            }
          ];
          setDocuments(demoList);
          if (!activeDocId) setActiveDocId(101);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeDocId, setActiveDocId]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setTimerActive(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSeconds]);

  // Podcast audio simulation ticker
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlayingPodcast && podcastData && podcastData.dialogue.length > 0) {
      interval = setInterval(() => {
        setActiveSpeechIdx(prev => (prev + 1) % podcastData.dialogue.length);
      }, 4500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingPodcast, podcastData]);

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(`Uploading and indexing "${file.name}"...`);
    try {
      await TeachMeAPI.documents.uploadPdf(file, 'General', 'session-1');
      await refreshDocuments();
      setUploadProgress('Document uploaded and indexed successfully into PgVector!');
    } catch {
      const demoDoc: DocumentHistoryDTO = {
        id: Date.now(),
        filename: file.name,
        fileSize: file.size,
        category: 'Course Notes',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };
      setDocuments(prev => [demoDoc, ...prev]);
      setActiveDocId(demoDoc.id);
      setUploadProgress('Document registered in demonstration workspace.');
    } finally {
      setTimeout(() => setUploadProgress(null), 3000);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(label);
    setTimeout(() => setCopiedNotice(null), 1800);
  };

  const handleLoadKnowledgeGraph = async () => {
    setActiveTool('graph');
    if (graphData) return;
    setIsGenerating(true);
    try {
      const data = await TeachMeAPI.documents.getKnowledgeGraph(activeDocId || 101);
      setGraphData(data);
      if (data.nodes.length > 0) setSelectedNodeId(data.nodes[0].id);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteHybridSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await TeachMeAPI.search.batchSearchAndReRank(searchQuery, 'session-1');
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadQuiz = async () => {
    setActiveTool('quiz');
    if (quizData) return;
    setIsGenerating(true);
    try {
      const quiz = await TeachMeAPI.quiz.generate(activeDocId || 101);
      setQuizData(quiz);
      setQuizAnswers(new Array(quiz.questions.length).fill(-1));
      setQuizResult(null);
    } catch {
      setQuizData({
        id: 1,
        title: 'Algorithmic Complexity & Asymptotics',
        description: 'Comprehensive evaluation of algorithm performance and recurrence bounds',
        totalQuestions: 3,
        passScore: 70,
        documentId: activeDocId || 101,
        questions: [
          {
            id: 1,
            questionText: 'What is the tightest upper bound of MergeSort in the worst-case scenario?',
            questionOrder: 1,
            options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
            correctAnswerIndex: 1,
            explanation: 'MergeSort recursively bisects the array into O(log n) recursion levels, each requiring linear O(n) merge work.'
          },
          {
            id: 2,
            questionText: 'Which theorem is commonly utilized to resolve recurrence relations of divide-and-conquer algorithms?',
            questionOrder: 2,
            options: ['Master Theorem', 'Fermat Little Theorem', 'Bayes Theorem', 'Central Limit Theorem'],
            correctAnswerIndex: 0,
            explanation: 'The Master Theorem delivers asymptotic bounds for recurrences of the form T(n) = aT(n/b) + f(n).'
          },
          {
            id: 3,
            questionText: 'What distance metric is leveraged in PgVector for cosine similarity embeddings?',
            questionOrder: 3,
            options: ['Cosine Distance (<=>)', 'Euclidean Distance (<->)', 'Taxicab Distance', 'Hamming Distance'],
            correctAnswerIndex: 0,
            explanation: 'Cosine distance operator <=> computes 1 - cosine_similarity for normalized vector embeddings.'
          }
        ]
      });
      setQuizAnswers([-1, -1, -1]);
      setQuizResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadFlashcards = async () => {
    setActiveTool('flashcards');
    if (flashcards.length > 0) return;
    setIsGenerating(true);
    try {
      const cards = await TeachMeAPI.flashcards.getDue();
      setFlashcards(cards);
      setCardIdx(0);
      setIsFlipped(false);
    } catch {
      setFlashcards([
        {
          id: 1,
          front: 'What is the time complexity of building a Binary Heap from an unordered array of n elements?',
          back: 'O(n) time complexity using Floyd bottom-up heap construction algorithm.',
          deckName: 'Algorithms',
          easeFactor: 2.5,
          interval: 1,
          repetitionNumber: 0
        },
        {
          id: 2,
          front: 'How does an HNSW index optimize high-dimensional vector nearest-neighbor search?',
          back: 'Hierarchical Navigable Small World graphs organize vector embeddings into multi-layered skip-list graphs for logarithmic traversal.',
          deckName: 'Vector Databases',
          easeFactor: 2.5,
          interval: 1,
          repetitionNumber: 0
        },
        {
          id: 3,
          front: 'Define the critical section problem in concurrent systems.',
          back: 'A design challenge ensuring mutual exclusion, progress, and bounded waiting when multiple threads access shared resources.',
          deckName: 'Operating Systems',
          easeFactor: 2.5,
          interval: 1,
          repetitionNumber: 0
        }
      ]);
      setCardIdx(0);
      setIsFlipped(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadRoadmap = async () => {
    setActiveTool('roadmap');
    if (roadmapData) return;
    setIsGenerating(true);
    try {
      const plan = await TeachMeAPI.studyPlan.generate(activeDocId || 101);
      setRoadmapData(plan);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadNotes = async () => {
    setActiveTool('notes');
    if (notesData) return;
    setIsGenerating(true);
    try {
      const notes = await TeachMeAPI.notes.getOutline(activeDocId || 101);
      setNotesData(notes);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPodcast = async () => {
    setActiveTool('podcast');
    if (podcastData) return;
    setIsGenerating(true);
    try {
      const pod = await TeachMeAPI.podcast.generate(activeDocId || 101);
      setPodcastData(pod);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSummary = async () => {
    setActiveTool('summary');
    if (summaryText) return;
    setIsGenerating(true);
    try {
      const res = await TeachMeAPI.summary.get(activeDocId || 101);
      setSummaryText(res.executiveSummary);
    } catch {
      setSummaryText(
        `### Executive Knowledge Brief: CS106B Algorithm Analysis\n\n` +
        `This document covers the formal foundational mathematics of asymptotic runtime analysis and recurrence solving:\n\n` +
        `- **Big-O Notation**: Asymptotic upper bounds describing worst-case scaling behavior.\n` +
        `- **Master Method**: Direct analytical framework for evaluating recurrence forms $T(n) = aT(n/b) + O(n^d)$.\n` +
        `- **Cache Locality**: Algorithmic differences in CPU cache invalidation between sequential arrays and linked nodes.\n\n` +
        `### Key Engineering Takeaways\n\n` +
        `1. **Divide and Conquer**: Subdivides problems into independent subproblems; complexity bounded by recurrence relations.\n` +
        `2. **Space-Time Trade-offs**: Dynamic programming trades auxiliary memory to prevent redundant re-evaluations.\n` +
        `3. **Empirical Benchmarks**: Algorithmic upper bounds determine scaling limits in production.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Flashcard rating action (Leitner / SM-2 spaced repetition)
  const handleScoreCard = (quality: number) => {
    const current = flashcards[cardIdx];
    if (current) {
      TeachMeAPI.flashcards.submitReview(current.id, quality);
    }
    setIsFlipped(false);
    if (cardIdx < flashcards.length - 1) {
      setCardIdx(cardIdx + 1);
    } else {
      setCardIdx(0);
    }
  };

  // Toggle milestone completion
  const handleToggleMilestone = (key: string) => {
    setCompletedMilestones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!quizData) return;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    setQuizResult({
      score,
      total: quizData.questions.length,
      percentage: Math.round((score / quizData.questions.length) * 100)
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 select-none relative font-sans">
      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10 animate-fade-in">
        
        {/* Workstation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Knowledge &amp; Intelligence Lab
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                PgVector HNSW
              </span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-[70ch]">
              High-dimensional vector embeddings, semantic graph exploration, automated pedagogical quizzes, and Cornell synthesis
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95 shrink-0">
            <UploadSimpleIcon className="w-4 h-4" weight="bold" />
            <span>Upload Document</span>
            <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {uploadProgress && (
          <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2.5 shadow-xs animate-slide-up">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {copiedNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs flex items-center gap-2 shadow-2xl animate-fade-in">
            <CheckIcon className="w-4 h-4 text-emerald-400" />
            <span>{copiedNotice} copied to clipboard</span>
          </div>
        )}

        {/* Primary Multi-Tool Navigation Bar */}
        <div className="flex items-center gap-1.5 border-b border-[#1c1f2e] pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTool('docs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'docs'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <FileTextIcon className="w-4 h-4" />
            <span>Documents ({documents.length})</span>
          </button>

          <button
            onClick={handleLoadKnowledgeGraph}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'graph'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <ShareNetworkIcon className="w-4 h-4" />
            <span>Concept Graph</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('search');
              if (searchResults.length === 0) void handleExecuteHybridSearch();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'search'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span>Hybrid Search</span>
          </button>

          <button
            onClick={handleLoadQuiz}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'quiz'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <QuestionIcon className="w-4 h-4" />
            <span>Auto Quiz</span>
          </button>

          <button
            onClick={handleLoadFlashcards}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'flashcards'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <StackIcon className="w-4 h-4" />
            <span>3D Flashcards</span>
          </button>

          <button
            onClick={handleLoadRoadmap}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'roadmap'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Study Roadmap</span>
          </button>

          <button
            onClick={handleLoadNotes}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'notes'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>Cornell Notes</span>
          </button>

          <button
            onClick={handleLoadPodcast}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'podcast'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <SpeakerHighIcon className="w-4 h-4" />
            <span>2-Speaker Podcast</span>
          </button>

          <button
            onClick={handleLoadSummary}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTool === 'summary'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <SparkleIcon className="w-4 h-4" />
            <span>Executive Brief</span>
          </button>
        </div>

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="p-8 text-center bg-[#0e1017] border border-[#1c1f2e] rounded-2xl space-y-3 animate-fade-in shadow-xs">
            <ArrowsClockwiseIcon className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <div className="text-xs font-mono text-zinc-300">Synthesizing intelligence telemetry from PgVector...</div>
          </div>
        )}

        {/* TOOL 1: Documents Grid */}
        {activeTool === 'docs' && !isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => {
              const isAttached = activeDocId === doc.id;
              return (
                <div
                  key={doc.id}
                  className={`bg-[#0e1017] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs ${
                    isAttached
                      ? 'border-indigo-500/80 ring-1 ring-indigo-500/30'
                      : 'border-[#1c1f2e] hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileTextIcon className="w-6 h-6 text-indigo-400 shrink-0" weight="duotone" />
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-zinc-100 truncate">
                            {doc.filename || doc.fileName}
                          </h3>
                          <span className="text-xs text-zinc-400 font-mono">
                            {doc.category || 'Computer Science'} • {((doc.fileSize || 1800000) / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      </div>

                      {isAttached && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-medium">
                          Active in Chat
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#171926] flex items-center justify-between text-xs">
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>1536-dim HNSW Indexed</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveDocId(isAttached ? null : doc.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isAttached
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60'
                        }`}
                      >
                        {isAttached ? 'Detach' : 'Attach to Chat'}
                      </button>

                      <button
                        onClick={() => {
                          setActiveDocId(doc.id);
                          setActiveTab('playground');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <span>Ask AI</span>
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TOOL 2: Concept Knowledge Graph */}
        {activeTool === 'graph' && !isGenerating && graphData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Interactive SVG Canvas */}
              <div className="lg:col-span-2 bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 relative overflow-hidden shadow-xs min-h-[420px] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Concept Vector Topology</span>
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        {graphData.nodes.length} Nodes • {graphData.edges.length} Edges
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Click any node to inspect semantic clustering and cross-reference citations</p>
                  </div>
                </div>

                {/* SVG Graph Visualization */}
                <div className="relative w-full h-[320px] bg-[#090a0f] rounded-xl border border-[#171926] p-4 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 500 300">
                    <defs>
                      <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Edge Lines */}
                    {graphData.edges.map((edge, idx) => {
                      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
                      const targetNode = graphData.nodes.find(n => n.id === edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const sIdx = graphData.nodes.indexOf(sourceNode);
                      const tIdx = graphData.nodes.indexOf(targetNode);
                      const sx = 100 + (sIdx % 3) * 150;
                      const sy = 60 + Math.floor(sIdx / 3) * 110;
                      const tx = 100 + (tIdx % 3) * 150;
                      const ty = 60 + Math.floor(tIdx / 3) * 110;

                      return (
                        <g key={idx}>
                          <line
                            x1={sx}
                            y1={sy}
                            x2={tx}
                            y2={ty}
                            stroke="url(#edgeGradient)"
                            strokeWidth="1.5"
                            strokeDasharray={edge.relationship === 'prerequisite' ? '4,4' : 'none'}
                          />
                        </g>
                      );
                    })}

                    {/* Node Circles */}
                    {graphData.nodes.map((node, idx) => {
                      const cx = 100 + (idx % 3) * 150;
                      const cy = 60 + Math.floor(idx / 3) * 110;
                      const isSelected = selectedNodeId === node.id;

                      return (
                        <g
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 22 : 18}
                            fill={isSelected ? '#6366f1' : '#141622'}
                            stroke={isSelected ? '#a5b4fc' : '#282c40'}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                          />
                          <text
                            x={cx}
                            y={cy + 32}
                            textAnchor="middle"
                            fill={isSelected ? '#f4f5f9' : '#9da3b8'}
                            fontSize="11"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            fontFamily="Inter, sans-serif"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Node Inspector Panel */}
              <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1c1f2e]">
                    <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      Node Details
                    </span>
                    <span className="text-xs font-mono text-zinc-400">ID: {selectedNodeId || 'none'}</span>
                  </div>

                  {(() => {
                    const node = graphData.nodes.find(n => n.id === selectedNodeId) || graphData.nodes[0];
                    if (!node) return null;
                    return (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="text-base font-bold text-white">{node.label}</h4>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 inline-block mt-1">
                            Group: {node.group || 'core'}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-zinc-300 mb-1">Concept Synopsis:</div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {node.description || 'Core algorithmic paradigm analyzing recursive structure and asymptotic resource expenditure.'}
                          </p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-zinc-300 mb-1">Associated Vector References:</div>
                          <div className="space-y-1.5">
                            <div className="text-xs font-mono text-zinc-400 bg-[#141622] p-2 rounded-lg border border-[#1c1f2e]">
                              Chunk #104: Asymptotic divide-and-conquer recurrence formulas
                            </div>
                            <div className="text-xs font-mono text-zinc-400 bg-[#141622] p-2 rounded-lg border border-[#1c1f2e]">
                              Chunk #108: Master Method bounds and recursion trees
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={() => {
                    const node = graphData.nodes.find(n => n.id === selectedNodeId) || graphData.nodes[0];
                    if (node) {
                      setActiveTab('playground');
                    }
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SparkleIcon className="w-4 h-4" />
                  <span>Explore Concept in Studio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 3: Hybrid PgVector Search */}
        {activeTool === 'search' && !isGenerating && (
          <div className="space-y-6">
            {/* Search Input and Slider Controls */}
            <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') void handleExecuteHybridSearch();
                    }}
                    placeholder="Enter natural language query or technical keyword..."
                    className="w-full bg-[#141622] border border-[#1c1f2e] focus:border-indigo-500/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-400 outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => void handleExecuteHybridSearch()}
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs border border-indigo-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <ArrowsClockwiseIcon className="w-4 h-4 animate-spin" /> : <MagnifyingGlassIcon className="w-4 h-4" />}
                  <span>Search PgVector</span>
                </button>
              </div>

              {/* Hybrid Weighting Slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#171926] text-xs">
                <div className="flex items-center gap-3">
                  <SlidersIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-zinc-300 font-semibold">Dense vs Sparse Weighting (Alpha):</span>
                  <span className="font-mono text-indigo-300">
                    {Math.round(searchAlpha * 100)}% Dense (Vector) / {Math.round((1 - searchAlpha) * 100)}% Sparse (Keyword)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={searchAlpha}
                  onChange={e => setSearchAlpha(parseFloat(e.target.value))}
                  className="w-44 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Showing {searchResults.length} matching embedding chunks</span>
                <span>Distance Metric: Cosine (&lt;=&gt;)</span>
              </div>

              {searchResults.map(chunk => (
                <div
                  key={chunk.chunkId}
                  className="bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 rounded-2xl p-5 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">Chunk {chunk.chunkId}</span>
                      <span className="text-xs font-mono text-zinc-400">• {chunk.documentName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        Score: {(chunk.cosineScore * 100).toFixed(1)}%
                      </div>
                      <button
                        onClick={() => handleCopy(chunk.text, `Chunk ${chunk.chunkId}`)}
                        className="text-zinc-400 hover:text-white p-1 rounded hover:bg-[#141622] transition-colors"
                        title="Copy chunk content"
                      >
                        <CopyIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-[#141622]/60 p-3 rounded-xl border border-[#1a1d2e]">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOL 4: Interactive Auto-Quiz Engine */}
        {activeTool === 'quiz' && !isGenerating && quizData && (
          <div className="max-w-2xl mx-auto bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#1c1f2e] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{quizData.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{quizData.description}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-mono">
                {quizData.totalQuestions} Questions
              </span>
            </div>

            <div className="space-y-6">
              {quizData.questions.map((q, qIdx) => {
                const selectedOpt = quizAnswers[qIdx];
                const isCorrect = selectedOpt === q.correctAnswerIndex;

                return (
                  <div key={q.id} className="space-y-3 p-4 rounded-xl bg-[#141622] border border-[#1c1f2e]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono font-semibold text-indigo-400">
                        Question {qIdx + 1} of {quizData.questions.length}
                      </span>
                      {quizResult && (
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-zinc-100">{q.questionText}</p>

                    <div className="space-y-2 mt-2">
                      {q.options.map((opt, optIdx) => {
                        let optStyle = 'bg-[#0e1017] border-[#1c1f2e] text-zinc-300 hover:border-zinc-600';
                        if (quizResult) {
                          if (optIdx === q.correctAnswerIndex) {
                            optStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200';
                          } else if (selectedOpt === optIdx) {
                            optStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200';
                          }
                        } else if (selectedOpt === optIdx) {
                          optStyle = 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (quizResult) return;
                              const updated = [...quizAnswers];
                              updated[qIdx] = optIdx;
                              setQuizAnswers(updated);
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${optStyle}`}
                          >
                            <span className="font-mono text-zinc-400 mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizResult && q.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-[#0e1017] border border-[#1c1f2e] text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-200">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
              {quizResult ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    Score: {quizResult.score} / {quizResult.total} ({quizResult.percentage}%)
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
                      quizResult.percentage >= 70
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {quizResult.percentage >= 70 ? 'Passed' : 'Needs Review'}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-400 font-mono">
                  {quizAnswers.filter(a => a !== -1).length} of {quizData.questions.length} answered
                </span>
              )}

              <div className="flex items-center gap-2">
                {quizResult ? (
                  <button
                    onClick={() => {
                      setQuizAnswers(new Array(quizData.questions.length).fill(-1));
                      setQuizResult(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={quizAnswers.some(a => a === -1)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Submit Answers
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 5: 3D Spaced-Repetition Flashcards */}
        {activeTool === 'flashcards' && !isGenerating && flashcards.length > 0 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Card {cardIdx + 1} of {flashcards.length}</span>
              <span>Deck: {flashcards[cardIdx].deckName}</span>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[260px] bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 rounded-3xl p-8 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 relative select-none hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-indigo-400 font-semibold uppercase tracking-wider">
                  {isFlipped ? 'Answer / Solution' : 'Question / Prompt'}
                </span>
                <span>Click to Flip</span>
              </div>

              <div className="py-6 text-center">
                <p className="text-base sm:text-lg font-bold text-zinc-100 leading-relaxed font-sans">
                  {isFlipped ? flashcards[cardIdx].back : flashcards[cardIdx].front}
                </p>
              </div>

              <div className="text-center text-xs font-mono text-zinc-400">
                {isFlipped ? 'Rate difficulty below to schedule next review' : 'Think of the answer, then click to check'}
              </div>
            </div>

            {/* Spaced-Repetition Feedback Buttons */}
            {isFlipped && (
              <div className="grid grid-cols-4 gap-2 pt-2 animate-fade-in">
                <button
                  onClick={() => handleScoreCard(1)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60 transition-all cursor-pointer"
                >
                  Again (&lt;1m)
                </button>
                <button
                  onClick={() => handleScoreCard(2)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60 transition-all cursor-pointer"
                >
                  Hard (10m)
                </button>
                <button
                  onClick={() => handleScoreCard(3)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60 transition-all cursor-pointer"
                >
                  Good (1d)
                </button>
                <button
                  onClick={() => handleScoreCard(4)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all cursor-pointer"
                >
                  Easy (4d)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TOOL 6: 5-Day Adaptive Study Roadmap */}
        {activeTool === 'roadmap' && !isGenerating && roadmapData && (
          <div className="space-y-6">
            {/* Header with Pomodoro Widget */}
            <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{roadmapData.planTitle}</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-[60ch]">5-Day structured sprint roadmap with active recall intervals</p>
              </div>

              {/* Pomodoro Timer Box */}
              <div className="flex items-center gap-4 bg-[#141622] border border-[#1c1f2e] px-4 py-3 rounded-xl shrink-0">
                <ClockIcon className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs text-zinc-400 font-mono">Pomodoro Focus</div>
                  <div className="text-lg font-mono font-bold text-white">{formatTimer(timerSeconds)}</div>
                </div>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`p-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    timerActive
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {timerActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 5-Day Plan Steps */}
            <div className="space-y-4">
              {roadmapData.schedule.map(day => (
                <div
                  key={day.day}
                  className="bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#1c1f2e]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                        Day {day.day}
                      </span>
                      <h4 className="text-sm font-bold text-white">{day.focusTopic}</h4>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">{day.estimatedHours} hours</span>
                  </div>

                  {/* Tasks Checklist */}
                  <div className="space-y-2">
                    {day.tasks.map((task, tIdx) => {
                      const key = `d${day.day}-t${tIdx}`;
                      const isDone = completedMilestones[key];

                      return (
                        <div
                          key={tIdx}
                          onClick={() => handleToggleMilestone(key)}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-zinc-400 line-through'
                              : 'bg-[#141622] border-[#1c1f2e] text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-400 text-black'
                                  : 'border-[#282c40] bg-[#0e1017]'
                              }`}
                            >
                              {isDone && <CheckIcon className="w-3 h-3" weight="bold" />}
                            </div>
                            <span className={isDone ? 'text-zinc-400' : 'text-zinc-200'}>{task}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOL 7: Cornell Lecture Notes */}
        {activeTool === 'notes' && !isGenerating && notesData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0e1017] border border-[#1c1f2e] p-5 rounded-2xl">
              <div>
                <h3 className="text-base font-bold text-white">{notesData.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Formal 3-Column Cornell Pedagogical Layout</p>
              </div>

              <button
                onClick={() => handleCopy(notesData.sections.map(s => `${s.heading}\n${s.keyPoints.join('\n')}`).join('\n\n'), 'Cornell Notes')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141622] hover:bg-[#1a1d2e] border border-[#282c40] text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <DownloadSimpleIcon className="w-4 h-4 text-indigo-400" />
                <span>Export Markdown</span>
              </button>
            </div>

            <div className="space-y-4">
              {notesData.sections.map((sec, idx) => (
                <div key={idx} className="bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1c1f2e] pb-3">
                    <h4 className="text-sm font-bold text-white">{sec.heading}</h4>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                      Level {sec.level}
                    </span>
                  </div>

                  <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1.5 leading-relaxed font-sans">
                    {sec.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>

                  {sec.formulas && sec.formulas.length > 0 && (
                    <div className="p-3 bg-[#141622] rounded-xl border border-[#1c1f2e] font-mono text-xs text-emerald-400 space-y-1">
                      {sec.formulas.map((f, fIdx) => (
                        <div key={fIdx}>Formula / Equation: {f}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOL 8: 2-Speaker AI Podcast Generator */}
        {activeTool === 'podcast' && !isGenerating && podcastData && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Audio Waveform Player Bar */}
            <div className="bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlayingPodcast(!isPlayingPodcast)}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                >
                  {isPlayingPodcast ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>

                <div>
                  <h3 className="text-sm font-bold text-white">{podcastData.title}</h3>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    Speakers: Alex &amp; Maya • ~{podcastData.durationMinutes} mins
                  </div>
                </div>
              </div>

              {/* Animated Waveform Bars */}
              <div className="hidden sm:flex items-center gap-1">
                {[12, 24, 32, 18, 40, 28, 14, 36, 22, 10, 30, 20].map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full bg-indigo-500 transition-all duration-300 ${
                      isPlayingPodcast ? 'animate-pulse' : 'opacity-40'
                    }`}
                    style={{ height: `${isPlayingPodcast ? (idx % 2 === 0 ? h : h * 0.7) : 10}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Transcript Timeline */}
            <div className="space-y-3">
              {podcastData.dialogue.map((turn, idx) => {
                const isActive = isPlayingPodcast && activeSpeechIdx === idx;
                const isAlex = turn.speaker.toLowerCase().includes('alex');

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-[#0e1017] border-[#1c1f2e]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-mono font-bold ${isAlex ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {turn.speaker}
                      </span>
                      {isActive && (
                        <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          Speaking...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">{turn.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOOL 9: Summary Brief */}
        {activeTool === 'summary' && !isGenerating && summaryText && (
          <div className="max-w-3xl mx-auto bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c1f2e] pb-4">
              <div className="flex items-center gap-2">
                <SparkleIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Executive Knowledge Brief</h3>
              </div>
              <button
                onClick={() => handleCopy(summaryText, 'Executive Brief')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#141622] hover:bg-[#1a1d2e] border border-[#282c40] text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CopyIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Brief</span>
              </button>
            </div>

            <div className="text-xs text-zinc-300 leading-relaxed space-y-4 font-sans whitespace-pre-wrap">
              {summaryText}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
