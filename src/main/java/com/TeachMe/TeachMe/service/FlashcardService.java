package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.FlashcardDTO;
import com.TeachMe.TeachMe.entity.Flashcard;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.FlashcardRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final DocumentRepository documentRepository;

    public FlashcardService(FlashcardRepository flashcardRepository,
                           DocumentRepository documentRepository) {
        this.flashcardRepository = flashcardRepository;
        this.documentRepository = documentRepository;
    }

    /**
     * Create a new flashcard from highlighted AI response
     */
    public FlashcardDTO createFlashcard(String front, String back, String sourceContent,
                                       String deckName, Long documentId, User currentUser) {
        log.info("Creating flashcard for user: {} in deck: {}", currentUser.getId(), deckName);

        Document doc = null;
        if (documentId != null) {
            doc = documentRepository.findById(documentId)
                    .orElse(null);
        }

        Flashcard flashcard = Flashcard.builder()
                .front(front)
                .back(back)
                .sourceContent(sourceContent)
                .deckName(deckName != null ? deckName : "General")
                .user(currentUser)
                .document(doc)
                .nextReviewDate(LocalDateTime.now(ZoneId.systemDefault())) // Ready for immediate review
                .build();

        Flashcard saved = flashcardRepository.save(flashcard);
        log.info("Flashcard created with ID: {}", saved.getId());
        return mapToDTO(saved);
    }

    /**
     * Get all flashcards for a user
     */
    public Page<FlashcardDTO> getUserFlashcards(Long userId, Pageable pageable) {
        return flashcardRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get flashcards in a specific deck
     */
    public Page<FlashcardDTO> getFlashcardsByDeck(Long userId, String deckName, Pageable pageable) {
        return flashcardRepository.findByUserIdAndDeckName(userId, deckName, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get flashcards due for review (Spaced Repetition)
     */
    public List<FlashcardDTO> getDueFlashcards(Long userId) {
        List<Flashcard> dueFlashcards = flashcardRepository.findDueForReview(userId, LocalDateTime.now(ZoneId.systemDefault()));
        return dueFlashcards.stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Submit a review response using SM-2 algorithm
     * quality: 0-5 where 0 = incorrect, 5 = perfect
     */
    public FlashcardDTO reviewFlashcard(Long flashcardId, int quality) {
        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new RuntimeException("Flashcard not found"));

        // SM-2 Algorithm
        int repetitions = flashcard.getRepetitionCount();
        double easeFactor = flashcard.getEaseFactor();
        int intervalDays = flashcard.getIntervalDays();

        // Update ease factor
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) {
            easeFactor = 1.3;
        }

        // Update interval
        if (quality < 3) {
            // Failed - reset
            repetitions = 0;
            intervalDays = 1;
        } else {
            repetitions++;
            intervalDays = switch (repetitions) {
                case 1 -> 1;
                case 2 -> 3;
                default -> (int) Math.round(intervalDays * easeFactor);
            };
        }

        flashcard.setRepetitionCount(repetitions);
        flashcard.setEaseFactor(easeFactor);
        flashcard.setIntervalDays(intervalDays);
        flashcard.setNextReviewDate(LocalDateTime.now(ZoneId.systemDefault()).plusDays(intervalDays));

        Flashcard updated = flashcardRepository.save(flashcard);
        log.info("Flashcard {} reviewed. Next review in {} days", flashcardId, intervalDays);
        return mapToDTO(updated);
    }

    /**
     * Delete a flashcard
     */
    public void deleteFlashcard(Long flashcardId) {
        flashcardRepository.deleteById(flashcardId);
        log.info("Flashcard {} deleted", flashcardId);
    }

    /**
     * Get flashcards for a document
     */
    public List<FlashcardDTO> getFlashcardsByDocument(Long documentId) {
        return flashcardRepository.findByDocumentId(documentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private FlashcardDTO mapToDTO(Flashcard flashcard) {
        return FlashcardDTO.builder()
                .id(flashcard.getId())
                .front(flashcard.getFront())
                .back(flashcard.getBack())
                .sourceContent(flashcard.getSourceContent())
                .repetitionCount(flashcard.getRepetitionCount())
                .easeFactor(flashcard.getEaseFactor())
                .intervalDays(flashcard.getIntervalDays())
                .nextReviewDate(flashcard.getNextReviewDate())
                .deckName(flashcard.getDeckName())
                .documentId(flashcard.getDocument() != null ? flashcard.getDocument().getId() : null)
                .documentName(flashcard.getDocument() != null ? flashcard.getDocument().getFileName() : null)
                .build();
    }
    /**
     * Consumes findByUserIdAndDeckName (List version) to get an entire deck for study mode
     */
    public List<FlashcardDTO> getEntireDeckForStudy(Long userId, String deckName) {
        return flashcardRepository.findByUserIdAndDeckName(userId, deckName).stream()
                .map(this::mapToDTO)
                .toList();
    }
}

