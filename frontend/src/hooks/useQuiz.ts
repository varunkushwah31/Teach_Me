import { useState, useEffect, useCallback } from 'react';
import { quizApi } from '../lib/apiClient';

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizItem {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  passScore: number;
  questions: QuizQuestion[];
}

export function useQuiz(documentId: number = 1) {
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  const generateQuiz = useCallback(async (docId: number) => {
    setLoading(true);
    try {
      const res = await quizApi.generate(docId);
      if (res?.questions) {
        setActiveQuiz(res as any);
      }
    } catch (err) {
      console.error('Failed to generate quiz', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateQuiz(documentId);
  }, [documentId, generateQuiz]);

  const selectOption = useCallback((questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!activeQuiz) return;
    const answersArray = activeQuiz.questions.map((_, idx) =>
      selectedAnswers[idx] ?? -1
    );

    try {
      const res = await quizApi.submitQuiz(activeQuiz.id, answersArray);
      setQuizResult(res);
      return res;
    } catch (err) {
      console.error('Failed to submit quiz', err);
    }
  }, [activeQuiz, selectedAnswers]);

  return {
    activeQuiz,
    loading,
    selectedAnswers,
    quizResult,
    selectOption,
    submitQuiz,
    generateQuiz,
  };
}
