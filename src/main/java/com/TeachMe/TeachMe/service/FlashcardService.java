package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.FlashcardDTO;
import com.TeachMe.TeachMe.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

public interface FlashcardService {
    boolean isOwnedByUser(Long flashcardId, Long userId);
    FlashcardDTO createFlashcard(String front, String back, String sourceContent, String deckName, Long documentId, User currentUser);
    Page<FlashcardDTO> getUserFlashcards(Long userId, Pageable pageable);
    Page<FlashcardDTO> getFlashcardsByDeck(Long userId, String deckName, Pageable pageable);
    List<FlashcardDTO> getDueFlashcards(Long userId);
    FlashcardDTO reviewFlashcard(Long flashcardId, int quality);
    Map<String, Object> getAnalytics(Long userId);
    void deleteFlashcard(Long flashcardId);
    List<FlashcardDTO> getFlashcardsByDocument(Long userId, Long documentId);
    List<FlashcardDTO> getEntireDeckForStudy(Long userId, String deckName);
}