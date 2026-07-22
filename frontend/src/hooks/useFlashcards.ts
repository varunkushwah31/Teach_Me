import { useState, useEffect, useCallback } from 'react';
import { flashcardApi } from '../lib/apiClient';

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  deckName: string;
  easeFactor?: number;
  intervalDays?: number;
}

export function useFlashcards() {
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDueCards = useCallback(async () => {
    setLoading(true);
    try {
      const cards = await flashcardApi.getDueCards();
      if (Array.isArray(cards)) setDueCards(cards);
    } catch (err) {
      console.error('Failed to load due flashcards', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  const reviewFlashcard = useCallback(async (flashcardId: number, quality: number) => {
    return await flashcardApi.reviewCard(flashcardId, quality);
  }, []);

  const createFlashcard = useCallback(async (data: { front: string; back: string; deckName?: string; sourceContent?: string }) => {
    return await flashcardApi.create(data);
  }, []);

  return {
    dueCards,
    loading,
    fetchDueCards,
    reviewFlashcard,
    createFlashcard,
  };
}
