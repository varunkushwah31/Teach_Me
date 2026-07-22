import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCw, CheckCircle2, Sparkles, Award, Check, X } from 'lucide-react';
import { useFlashcards } from '../hooks/useFlashcards';
import { useQuiz } from '../hooks/useQuiz';

export const StudyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  // Custom Hooks encapsulation per vercel-composition-patterns
  const { dueCards, reviewFlashcard } = useFlashcards();
  const { activeQuiz, selectedAnswers, quizResult, selectOption, submitQuiz } = useQuiz(1);

  // Flashcards UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleReview = async (quality: number) => {
    if (dueCards.length === 0) return;
    const card = dueCards[currentIndex];
    await reviewFlashcard(card.id, quality);

    if (currentIndex + 1 < dueCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const currentCard = dueCards[currentIndex];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            Spaced <span className="gradient-text-orange font-extrabold">Repetition</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">SM-2 flashcard scheduler and AI-generated document quizzes.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 p-1 rounded-xl border border-white/5 flex items-center gap-1 z-10">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white orange-glow shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Flashcards ({dueCards.length} Due)
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white orange-glow shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Active Quiz
          </button>
        </div>
      </div>

      {/* FLASHCARD TAB */}
      {activeTab === 'flashcards' && (
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {completed || dueCards.length === 0 ? (
            <Card variant="default" className="text-center py-16 px-12 max-w-lg w-full relative overflow-hidden">
              <div className="glow-ambient-cyan top-[0px] left-[0px]" />
              <div className="w-16 h-16 bg-[#06B6D4]/10 rounded-full flex items-center justify-center text-[#06B6D4] mx-auto mb-4 cyan-glow z-10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 font-heading z-10">All Cards Mastered for Today!</h2>
              <p className="text-xs text-[#94A3B8] mb-6 z-10">
                SM-2 algorithm has scheduled your next review interval. Great progress!
              </p>
              <button
                onClick={() => {
                  setCompleted(false);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
                className="bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 transition-all cursor-pointer z-10"
              >
                <RotateCw className="w-3.5 h-3.5" /> Restart Deck Session
              </button>
            </Card>
          ) : (
            <>
              {/* Deck Info Header */}
              <div className="flex items-center justify-between w-full max-w-2xl text-xs font-mono text-[#94A3B8]">
                <Badge variant="cyan">{currentCard?.deckName || 'General Deck'}</Badge>
                <span className="font-semibold tracking-wider">
                  Card {currentIndex + 1} of {dueCards.length}
                </span>
              </div>

              {/* Main Flashcard Container (3D Flip) */}
              <div className="w-full max-w-2xl flashcard-container min-h-[280px] mb-2 z-10">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className={`flashcard-inner cursor-pointer w-full block text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F97316]/50 rounded-2xl ${showAnswer ? 'flashcard-flipped' : ''}`}
                >
                  {/* Front Side */}
                  <div className="flashcard-front bg-[#0D0D17]/80 border border-white/5 shadow-2xl flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-mono uppercase tracking-widest">
                      <span className="text-[#F97316] font-bold">Question Side</span>
                      <span className="animate-pulse">Click to flip ↺</span>
                    </div>
                    
                    <div className="my-auto px-4">
                      <h3 className="text-base font-bold text-white leading-relaxed font-heading">
                        {currentCard?.front}
                      </h3>
                    </div>

                    <div className="text-center text-[10px] text-[#94A3B8] font-mono pt-3 border-t border-white/5">
                      Tap anywhere to reveal back answer
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="flashcard-back bg-[#0D0D17]/95 border border-[#F97316]/20 shadow-2xl flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-mono uppercase tracking-widest">
                      <span className="text-[#06B6D4] font-bold">Answer Details</span>
                      <span>Click to flip ↺</span>
                    </div>

                    <div className="my-auto px-4">
                      <h3 className="text-base font-bold text-[#F8FAFC] leading-relaxed font-heading">
                        {currentCard?.back}
                      </h3>
                      <p className="text-[10px] text-[#06B6D4] font-mono mt-3 uppercase tracking-wider">
                        Interval: {currentCard?.intervalDays || 1} day(s) • Ease Factor: {currentCard?.easeFactor || 2.5}
                      </p>
                    </div>

                    <div className="text-center text-[10px] text-[#94A3B8] font-mono pt-3 border-t border-white/5">
                      Evaluate recall difficulty below
                    </div>
                  </div>
                </button>
              </div>

              {/* Bottom Control Evaluation Bar (SM-2 Spaced Repetition) */}
              <div className="grid grid-cols-4 gap-3 w-full max-w-2xl pt-2 z-10">
                <button
                  onClick={() => handleReview(1)}
                  aria-label="Evaluate Again (<1 min)"
                  className="bg-white/5 border border-white/5 hover:bg-[#EF4444]/15 hover:border-[#EF4444]/40 text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-[#EF4444] cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#EF4444] group-hover:scale-105 transition-transform">Again</span>
                  <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">&lt; 1 min</span>
                </button>

                <button
                  onClick={() => handleReview(2)}
                  aria-label="Evaluate Hard (6 mins)"
                  className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                >
                  <span className="text-xs font-bold text-white group-hover:scale-105 transition-transform">Hard</span>
                  <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">6 mins</span>
                </button>

                <button
                  onClick={() => handleReview(4)}
                  aria-label="Evaluate Good (10 mins)"
                  className="bg-white/5 border border-white/5 hover:bg-[#F97316]/15 hover:border-[#F97316]/40 text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-[#F97316] cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#F97316] group-hover:scale-105 transition-transform">Good</span>
                  <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">10 mins</span>
                </button>

                <button
                  onClick={() => handleReview(5)}
                  aria-label="Evaluate Easy (4 days)"
                  className="bg-white/5 border border-white/5 hover:bg-[#06B6D4]/15 hover:border-[#06B6D4]/40 text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-[#06B6D4] cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#06B6D4] group-hover:scale-105 transition-transform">Easy</span>
                  <span className="text-[9px] text-[#94A3B8] font-mono mt-0.5">4 days</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && activeQuiz && (
        <div className="space-y-6">
          <Card variant="default">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">{activeQuiz.title}</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  5-Question Multiple Choice Quiz generated from document chunks.
                </p>
              </div>
              <Badge variant="orange">Pass Score: 80%</Badge>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-[#06060A]/50 border border-white/5 space-y-4">
                  <p className="text-xs font-bold text-white leading-relaxed">
                    Q{qIdx + 1}. {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={`${q.id}-opt-${optIdx}`}
                          onClick={() => selectOption(qIdx, optIdx)}
                          className={`text-left p-3.5 rounded-xl text-xs transition-all border focus-visible:ring-2 focus-visible:ring-[#F97316] cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 border-[#F97316] text-white font-semibold shadow-[0_0_20px_rgba(249,115,22,0.05)]'
                              : 'bg-white/5 border-white/5 text-[#94A3B8] hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <span className="font-mono text-[#F97316] mr-2">
                            {String.fromCodePoint(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={submitQuiz}
                aria-label="Submit Quiz for Grading"
                className="bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs px-6 py-3 rounded-xl font-bold orange-glow flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#F97316] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Quiz for Grading</span>
              </button>
            </div>
          </Card>

          {/* Graded Feedback Result Card */}
          {quizResult && (
            <Card variant="highlight" className="border-[#06B6D4]/30 shadow-[0_0_40px_rgba(6,182,212,0.05)] relative overflow-hidden">
              <div className="glow-ambient-cyan top-[0px] right-[0px]" />
              <div className="flex items-center gap-3 mb-6 z-10 relative">
                <div className="p-2.5 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">Quiz Results Graded</h3>
                  <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                    Score: <span className="text-[#06B6D4] font-bold">{quizResult.score}%</span> ({quizResult.correctAnswers}/{quizResult.totalQuestions} correct)
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant={quizResult.passed ? 'success' : 'danger'}>
                    {quizResult.passed ? 'PASSED' : 'NEEDS REVIEW'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 z-10 relative">
                {quizResult.feedback?.map((fb: any, idx: number) => (
                  <div key={`feedback-${idx}-${fb.questionText.slice(0, 10)}`} className="p-4 rounded-xl bg-[#06060A]/80 border border-white/5 text-xs space-y-1.5">
                    <p className="font-semibold text-white flex items-center gap-2">
                      {fb.isCorrect ? (
                        <Check className="w-4 h-4 text-[#06B6D4]" />
                      ) : (
                        <X className="w-4 h-4 text-[#EF4444]" />
                      )}
                      <span>Q{idx + 1}: {fb.questionText}</span>
                    </p>
                    <p className="text-[11px] text-[#94A3B8] font-sans pl-6 leading-relaxed">{fb.explanation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
