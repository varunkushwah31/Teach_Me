package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.FlashcardDTO;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.entity.Flashcard;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.repository.FlashcardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final DocumentRepository documentRepository;

    public FlashcardService(FlashcardRepository flashcardRepository,
                            DocumentRepository documentRepository) {
        this.flashcardRepository = flashcardRepository;
        this.documentRepository = documentRepository;
    }

    /**
     * Returns true when the flashcard with {@code flashcardId} belongs to the
     * user identified by {@code userId}. Used by the controller layer to gate
     * mutating operations (review, delete) so that no user can modify another
     * user's SM-2 schedule by guessing or enumerating IDs.
     */
    public boolean isOwnedByUser(Long flashcardId, Long userId) {
        return flashcardRepository.findById(flashcardId)
                .map(fc -> fc.getUser().getId().equals(userId))
                .orElse(false); // not found → treat as not owned
    }

    @Transactional
    public FlashcardDTO createFlashcard(String front, String back, String sourceContent,
                                        String deckName, Long documentId, User currentUser) {
        log.info("Creating flashcard for user {} in deck '{}'", currentUser.getId(), deckName);

        Document doc = null;
        if (documentId != null) {
            doc = documentRepository.findById(documentId).orElse(null);
        }

        Flashcard flashcard = Flashcard.builder()
                .front(front)
                .back(back)
                .sourceContent(sourceContent)
                .deckName(deckName != null ? deckName : "General")
                .user(currentUser)
                .document(doc)
                .nextReviewDate(LocalDateTime.now(ZoneId.systemDefault()))
                .build();

        Flashcard saved = flashcardRepository.save(flashcard);
        log.info("Flashcard created with ID: {}", saved.getId());
        return mapToDTO(saved);
    }

    public Page<FlashcardDTO> getUserFlashcards(Long userId, Pageable pageable) {
        return flashcardRepository.findByUserId(userId, pageable).map(this::mapToDTO);
    }

    public Page<FlashcardDTO> getFlashcardsByDeck(Long userId, String deckName, Pageable pageable) {
        return flashcardRepository.findByUserIdAndDeckName(userId, deckName, pageable)
                .map(this::mapToDTO);
    }

    public List<FlashcardDTO> getDueFlashcards(Long userId) {
        return flashcardRepository
                .findDueForReview(userId, LocalDateTime.now(ZoneId.systemDefault()))
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * @Transactional
     */
    @Transactional
    public FlashcardDTO reviewFlashcard(Long flashcardId, int quality) {
        Flashcard flashcard = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new RuntimeException("Flashcard not found: " + flashcardId));

        int repetitions = flashcard.getRepetitionCount();
        double easeFactor = flashcard.getEaseFactor();
        int intervalDays = flashcard.getIntervalDays();

        // SM-2 ease-factor update
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        if (quality < 3) {
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
        flashcard.setNextReviewDate(
                LocalDateTime.now(ZoneId.systemDefault()).plusDays(intervalDays));

        Flashcard updated = flashcardRepository.save(flashcard);
        log.info("Flashcard {} reviewed — next review in {} days", flashcardId, intervalDays);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteFlashcard(Long flashcardId) {
        flashcardRepository.deleteById(flashcardId);
        log.info("Flashcard {} deleted", flashcardId);
    }

    public List<FlashcardDTO> getFlashcardsByDocument(Long userId, Long documentId) {
        return flashcardRepository.findByUserIdAndDocumentId(userId, documentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<FlashcardDTO> getEntireDeckForStudy(Long userId, String deckName) {
        return flashcardRepository.findByUserIdAndDeckName(userId, deckName).stream()
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
}