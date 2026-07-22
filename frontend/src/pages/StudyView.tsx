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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Spaced Repetition & Quizzes</h1>
          <p className="text-xs text-[#A1A1AA]">SM-2 flashcard scheduler and AI-generated document quizzes.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#1A1A1A] p-1 rounded-xl border border-[#27272A] flex items-center gap-1">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'flashcards'
                ? 'bg-[#F97316] text-white orange-glow'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Flashcards ({dueCards.length} Due)
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'quiz'
                ? 'bg-[#F97316] text-white orange-glow'
                : 'text-[#A1A1AA] hover:text-white'
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
            <Card variant="default" className="text-center py-16 px-12 max-w-lg w-full">
              <div className="w-16 h-16 bg-[#06B6D4]/10 rounded-full flex items-center justify-center text-[#06B6D4] mx-auto mb-4 cyan-glow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">All Cards Mastered for Today!</h2>
              <p className="text-xs text-[#A1A1AA] mb-6">
                SM-2 algorithm has scheduled your next review interval. Great progress!
              </p>
              <button
                onClick={() => {
                  setCompleted(false);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
                className="bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5" /> Restart Deck Session
              </button>
            </Card>
          ) : (
            <>
              {/* Deck Info Header */}
              <div className="flex items-center justify-between w-full max-w-2xl text-xs font-mono text-[#A1A1AA]">
                <Badge variant="cyan">{currentCard?.deckName || 'General Deck'}</Badge>
                <span>
                  Card {currentIndex + 1} of {dueCards.length}
                </span>
              </div>

              {/* Main Flashcard Container */}
              <div
                onClick={() => setShowAnswer(!showAnswer)}
                className="w-full max-w-2xl min-h-[280px] bg-[#1A1A1A] border border-[#27272A] hover:border-[#F97316]/50 rounded-2xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-2xl relative group overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-[#A1A1AA] font-mono mb-4">
                  <span className="text-[#F97316] font-semibold">
                    {showAnswer ? 'ANSWER SIDE' : 'QUESTION SIDE'}
                  </span>
                  <span className="group-hover:text-white">Click card to flip ↺</span>
                </div>

                <div className="my-auto text-center space-y-3">
                  <h3 className="text-lg font-semibold text-white leading-relaxed">
                    {showAnswer ? currentCard?.back : currentCard?.front}
                  </h3>
                  {showAnswer && (
                    <p className="text-xs text-[#06B6D4] font-mono">
                      Interval: {currentCard?.intervalDays || 1} day(s) • Ease: {currentCard?.easeFactor || 2.5}
                    </p>
                  )}
                </div>

                <div className="text-center text-[11px] text-[#A1A1AA] font-mono pt-4 border-t border-[#27272A]">
                  {!showAnswer ? 'Tap anywhere to reveal back' : 'Evaluate recall difficulty below'}
                </div>
              </div>

              {/* Bottom Control Evaluation Bar (SM-2 Spaced Repetition) */}
              <div className="grid grid-cols-4 gap-3 w-full max-w-2xl pt-2">
                <button
                  onClick={() => handleReview(1)}
                  aria-label="Evaluate Again (<1 min)"
                  className="bg-[#1A1A1A] hover:bg-[#EF4444]/10 hover:border-[#EF4444] border border-[#27272A] text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                >
                  <span className="text-xs font-bold text-[#EF4444] group-hover:scale-105">Again</span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">&lt; 1 min</span>
                </button>

                <button
                  onClick={() => handleReview(2)}
                  aria-label="Evaluate Hard (6 mins)"
                  className="bg-[#1A1A1A] hover:bg-[#27272A] hover:border-white border border-[#27272A] text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="text-xs font-bold text-white group-hover:scale-105">Hard</span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">6 mins</span>
                </button>

                <button
                  onClick={() => handleReview(4)}
                  aria-label="Evaluate Good (10 mins)"
                  className="bg-[#1A1A1A] hover:bg-[#F97316]/10 hover:border-[#F97316] border border-[#27272A] text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-[#F97316]"
                >
                  <span className="text-xs font-bold text-[#F97316] group-hover:scale-105">Good</span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">10 mins</span>
                </button>

                <button
                  onClick={() => handleReview(5)}
                  aria-label="Evaluate Easy (4 days)"
                  className="bg-[#1A1A1A] hover:bg-[#06B6D4]/10 hover:border-[#06B6D4] border border-[#27272A] text-white p-3 rounded-xl flex flex-col items-center justify-center transition-all group focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
                >
                  <span className="text-xs font-bold text-[#06B6D4] group-hover:scale-105">Easy</span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">4 days</span>
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
            <div className="flex items-center justify-between mb-4 border-b border-[#27272A] pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">{activeQuiz.title}</h2>
                <p className="text-xs text-[#A1A1AA]">
                  5-Question Multiple Choice Quiz generated from document chunks.
                </p>
              </div>
              <Badge variant="orange">Pass Score: 80%</Badge>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-xl bg-[#0F0F0F] border border-[#27272A] space-y-3">
                  <p className="text-xs font-semibold text-white">
                    Q{qIdx + 1}. {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectOption(qIdx, optIdx)}
                          className={`text-left p-3 rounded-lg text-xs transition-all border focus-visible:ring-2 focus-visible:ring-[#F97316] ${
                            isSelected
                              ? 'bg-[#F97316]/20 border-[#F97316] text-white font-medium'
                              : 'bg-[#1A1A1A] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                          }`}
                        >
                          <span className="font-mono text-[#F97316] mr-2">
                            {String.fromCharCode(65 + optIdx)}.
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
                className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs px-6 py-2.5 rounded-lg font-medium orange-glow flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#F97316]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Quiz for Grading</span>
              </button>
            </div>
          </Card>

          {/* Graded Feedback Result Card */}
          {quizResult && (
            <Card variant="highlight" className="border-[#06B6D4]/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Quiz Results Graded</h3>
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    Score: <span className="text-[#06B6D4] font-bold">{quizResult.score}%</span> ({quizResult.correctAnswers}/{quizResult.totalQuestions} correct)
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant={quizResult.passed ? 'success' : 'danger'}>
                    {quizResult.passed ? 'PASSED' : 'NEEDS REVIEW'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                {quizResult.feedback?.map((fb: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0F0F0F] text-xs space-y-1">
                    <p className="font-medium text-white flex items-center gap-2">
                      {fb.isCorrect ? (
                        <Check className="w-4 h-4 text-[#06B6D4]" />
                      ) : (
                        <X className="w-4 h-4 text-[#EF4444]" />
                      )}
                      <span>Q{idx + 1}: {fb.questionText}</span>
                    </p>
                    <p className="text-[11px] text-[#A1A1AA] font-mono pl-6">{fb.explanation}</p>
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
