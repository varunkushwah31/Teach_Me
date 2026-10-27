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
            explanation: 'MergeSort recursively bisects the array in O(log n) levels, each requiring linear O(n) merge work.'
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
      setActiveTool('flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await TeachMeAPI.summary.get(activeDocId || 101);
      setSummaryText(res.executiveSummary);
      setActiveTool('summary');
    } catch {
      setSummaryText(
        `# Executive Knowledge Brief: CS106B Algorithm Analysis\n\n` +
        `### Core Architecture Concepts\n` +
        `This document covers the formal foundational mathematics of asymptotic runtime analysis and recurrence solving:\n\n` +
        `- **Big-O Notation**: Asymptotic upper bounds describing worst-case scaling behavior.\n` +
        `- **Master Method**: Direct analytical framework for evaluating recurrence forms $T(n) = aT(n/b) + O(n^d)$.\n` +
        `- **Cache Locality**: Algorithmic differences in CPU cache invalidation between sequential arrays and linked nodes.\n\n` +
        `### Key Engineering Takeaways\n\n` +
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
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-y-auto px-6 md:px-12 py-8 select-none relative">
      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Knowledge &amp; PgVector Index
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                PgVector RAG
              </span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Index course materials and documents into PostgreSQL vector embeddings for grounded AI retrieval
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95 flex-shrink-0">
            <UploadSimpleIcon className="w-4 h-4" weight="bold" />
            <span>Upload Document</span>
            <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {uploadProgress && (
          <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2.5 shadow-xs animate-slide-up">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-[#1c1f2e] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTool('docs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'docs'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
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
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
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
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
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
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131d] border border-transparent'
            }`}
          >
            <SparkleIcon className="w-4 h-4" />
            <span>Summary Brief</span>
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
                            {doc.category || 'General'}
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
                      <span>Vector Ready</span>
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

        {/* Tab 2: Auto Quiz View */}
        {activeTool === 'quiz' && quizData && (
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
                              ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100 ring-1 ring-indigo-500/30'
                              : 'border-[#1c1f2e] bg-[#121420] text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-600'
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

            <div className="pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/30 transition-all cursor-pointer shadow-xs"
              >
                Submit Quiz
              </button>
            </div>

            {quizResult && (
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-indigo-200 text-xs shadow-xs animate-fade-in flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">Quiz Results</span>
                  <span className="text-zinc-300">You scored {quizResult.score} out of {quizResult.total} questions ({quizResult.percentage}%)</span>
                </div>
                <div className="text-lg font-bold font-mono text-indigo-300">
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
              className="h-64 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/50 p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-xl select-none relative"
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Card {cardIdx + 1} of {flashcards.length}</span>
                <span className="text-indigo-300 font-medium">Click card to Flip</span>
              </div>

              <div className="text-center text-sm md:text-base font-semibold text-zinc-100 leading-relaxed px-4">
                {isFlipped ? flashcards[cardIdx].back : flashcards[cardIdx].front}
              </div>

              <div className="text-center text-xs text-indigo-300 font-mono font-medium">
                {isFlipped ? '[ANSWER]' : '[QUESTION]'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIdx(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-[#121420] border border-[#202334] text-xs text-zinc-300 hover:text-white hover:bg-[#1a1c2c] transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-zinc-400 font-mono">
                {cardIdx + 1} / {flashcards.length}
              </span>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIdx(prev => (prev + 1) % flashcards.length);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 border border-indigo-400/30 transition-all cursor-pointer shadow-xs"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Summary View */}
        {activeTool === 'summary' && summaryText && (
          <div className="max-w-3xl mx-auto bg-[#0e1017] border border-[#1c1f2e] rounded-2xl p-6 sm:p-8 shadow-xl text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans animate-fade-in">
            {summaryText}
          </div>
        )}
      </div>
    </div>
  );
};
