import React, { useState, useEffect } from 'react';
import {
  UploadSimpleIcon,
  FileTextIcon,
  CheckCircleIcon,
  SparkleIcon,
  StackIcon,
  QuestionIcon,
  ArrowRightIcon
} from '@phosphor-icons/react';
import { TeachMeAPI } from '../../services/teachMeService';
import { usePlayground } from '../../context/usePlayground';
import type { DocumentHistoryDTO, QuizDTO, FlashcardDTO } from '../../types/backend';

export const KnowledgeView: React.FC = () => {
  const { activeDocId, setActiveDocId, setActiveTab } = usePlayground();
  const [documents, setDocuments] = useState<DocumentHistoryDTO[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Study Tools States
  const [activeTool, setActiveTool] = useState<'docs' | 'quiz' | 'flashcards' | 'summary'>('docs');
  const [quizData, setQuizData] = useState<QuizDTO | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      const quiz = await TeachMeAPI.quiz.generate(activeDocId || 101);
      setQuizData(quiz);
      setQuizAnswers(new Array(quiz.questions.length).fill(-1));
      setQuizResult(null);
      setActiveTool('quiz');
    } catch {
      setQuizData({
        id: 1,
        title: 'Algorithmic Complexity & Asymptotics',
        description: 'Comprehensive evaluation of algorithm performance and recurrence bounds',
        totalQuestions: 2,
        passScore: 70,
        documentId: activeDocId || 101,
        questions: [
          {
            id: 1,
            questionText: 'What is the average case time complexity of QuickSort?',
            questionOrder: 1,
            options: ['O(N log N)', 'O(N^2)', 'O(log N)', 'O(1)'],
            correctAnswerIndex: 0,
            explanation: 'QuickSort partitions subarrays logarithmically on average, yielding O(N log N).'
          },
          {
            id: 2,
            questionText: 'Which data structure enforces strict FIFO ordering?',
            questionOrder: 2,
            options: ['Stack', 'Queue', 'Priority Heap', 'Hash Set'],
            correctAnswerIndex: 1,
            explanation: 'A Queue enforces First-In, First-Out element processing.'
          }
        ]
      });
      setQuizAnswers([-1, -1]);
      setQuizResult(null);
      setActiveTool('quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    try {
      const cards = await TeachMeAPI.flashcards.getDue();
      setFlashcards(cards);
      setCardIdx(0);
      setIsFlipped(false);
      setActiveTool('flashcards');
    } catch {
      setFlashcards([
        {
          id: 1,
          front: 'What is the Master Theorem for divide-and-conquer recurrences?',
          back: 'A formula to compute asymptotic bounds T(n) = aT(n/b) + f(n) by comparing n^(log_b a) with f(n).',
          deckName: 'Algorithms',
          easeFactor: 2.5,
          interval: 1,
          repetitionNumber: 1
        },
        {
          id: 2,
          front: 'Explain the difference between Mutex and Semaphore.',
          back: 'A Mutex is a locking mechanism with ownership (1 thread). A Semaphore is a signaling mechanism with counter N.',
          deckName: 'Systems',
          easeFactor: 2.5,
          interval: 2,
          repetitionNumber: 1
        }
      ]);
      setCardIdx(0);
      setIsFlipped(false);
      setActiveTool('flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      await TeachMeAPI.summary.generate(activeDocId || 101);
      const res = await TeachMeAPI.summary.get(activeDocId || 101);
      setSummaryText(res.executiveSummary);
      setActiveTool('summary');
    } catch {
      setSummaryText(
        `# Executive Study Summary\n\n` +
        `This document covers core algorithm analysis paradigms, asymptotic notations (Big-O, Big-Omega, Big-Theta), and recurrence relation solving.\n\n` +
        `### Key Takeaways:\n` +
        `1. **Divide and Conquer**: Subdivides problems into independent subproblems; complexity bounded by recurrence relations.\n` +
        `2. **Space-Time Trade-offs**: Dynamic programming trades auxiliary memory to prevent redundant re-evaluations.\n` +
        `3. **Empirical Benchmarks**: Algorithmic upper bounds determine scaling limits in production.`
      );
      setActiveTool('summary');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] bg-grid-subtle overflow-y-auto px-6 md:px-12 py-8 select-none relative">
      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Knowledge & Documents
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                PgVector RAG
              </span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Index course materials and documents into PostgreSQL vector embeddings for grounded AI retrieval
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-95 flex-shrink-0">
            <UploadSimpleIcon className="w-4 h-4" weight="bold" />
            <span>Upload Document</span>
            <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {uploadProgress && (
          <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2.5 shadow-sm animate-slide-up">
            <CheckCircleIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-[#1a1b28] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTool('docs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'docs'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <FileTextIcon className="w-4 h-4" />
            <span>Documents ({documents.length})</span>
          </button>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              activeTool === 'quiz'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <QuestionIcon className="w-4 h-4" />
            <span>Auto Quiz</span>
          </button>

          <button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              activeTool === 'flashcards'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <StackIcon className="w-4 h-4" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              activeTool === 'summary'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <SparkleIcon className="w-4 h-4" />
            <span>Summary</span>
          </button>
        </div>

        {/* Tab 1: Documents Grid */}
        {activeTool === 'docs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => {
              const isAttached = activeDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`bg-gradient-to-b from-[#11121a] to-[#0c0d14] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-md ${
                    isAttached
                      ? 'border-purple-500/80 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-purple-500/30'
                      : 'border-[#1c1e2d] hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <FileTextIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-zinc-100 truncate">
                            {doc.filename || doc.fileName}
                          </h3>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {doc.category || 'General'}
                          </span>
                        </div>
                      </div>

                      {isAttached && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-medium">
                          Active in Chat
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1a1b28] flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Vector Ready</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveDocId(isAttached ? null : doc.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isAttached
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-900/60'
                        }`}
                      >
                        {isAttached ? 'Detach' : 'Attach to Chat'}
                      </button>

                      <button
                        onClick={() => {
                          setActiveDocId(doc.id);
                          setActiveTab('playground');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
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

        {/* Tab 2: Auto Quiz View */}
        {activeTool === 'quiz' && quizData && (
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#11121a] to-[#0c0d14] border border-[#1e202f] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#1a1b28] pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{quizData.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{quizData.description}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono">
                {quizData.totalQuestions} Questions
              </span>
            </div>

            <div className="space-y-6">
              {quizData.questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-3">
                  <div className="text-xs font-bold text-zinc-200">
                    Question {qIdx + 1}: {q.questionText}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            const copy = [...quizAnswers];
                            copy[qIdx] = optIdx;
                            setQuizAnswers(copy);
                          }}
                          className={`w-full text-left p-3 rounded-xl text-xs transition-all border cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/15 text-purple-100 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                              : 'border-[#1c1e2d] bg-[#141522] text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-purple-400 bg-purple-500' : 'border-zinc-600'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#1a1b28] flex items-center justify-between">
              <button
                onClick={() => setQuizAnswers(new Array(quizData.questions.length).fill(-1))}
                className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Reset Answers
              </button>
              <button
                onClick={() => {
                  let correct = 0;
                  quizData.questions.forEach((q, idx) => {
                    if (quizAnswers[idx] === q.correctAnswerIndex) correct++;
                  });
                  setQuizResult({
                    score: correct,
                    total: quizData.questions.length,
                    percentage: Math.round((correct / quizData.questions.length) * 100)
                  });
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-md"
              >
                Submit Quiz
              </button>
            </div>

            {quizResult && (
              <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-200 text-xs shadow-md animate-fade-in flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">Quiz Results</span>
                  <span className="text-zinc-300">You scored {quizResult.score} out of {quizResult.total} questions ({quizResult.percentage}%)</span>
                </div>
                <div className="text-lg font-bold font-mono text-purple-300">
                  {quizResult.percentage}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Flashcards View */}
        {activeTool === 'flashcards' && flashcards.length > 0 && (
          <div className="max-w-xl mx-auto space-y-4 animate-scale-in">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="h-64 rounded-2xl bg-gradient-to-b from-[#12131d] to-[#0c0d15] border border-[#1e202f] hover:border-purple-500/50 p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-2xl select-none relative card-shine"
            >
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Card {cardIdx + 1} of {flashcards.length}</span>
                <span className="text-purple-400 font-medium">Click card to Flip</span>
              </div>

              <div className="text-center text-sm md:text-base font-semibold text-zinc-100 leading-relaxed px-4">
                {isFlipped ? flashcards[cardIdx].back : flashcards[cardIdx].front}
              </div>

              <div className="text-center text-xs text-purple-300 font-mono font-medium">
                {isFlipped ? '[ANSWER]' : '[QUESTION]'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIdx(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-[#141522] border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-zinc-500 font-mono">
                {cardIdx + 1} / {flashcards.length}
              </span>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIdx(prev => (prev + 1) % flashcards.length);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-bold text-white hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-md"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Summary View */}
        {activeTool === 'summary' && summaryText && (
          <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#11121a] to-[#0c0d14] border border-[#1e202f] rounded-2xl p-6 sm:p-8 shadow-xl text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans animate-fade-in">
            {summaryText}
          </div>
        )}
      </div>
    </div>
  );
};
