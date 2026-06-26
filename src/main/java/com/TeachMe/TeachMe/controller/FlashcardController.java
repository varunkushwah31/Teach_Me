package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.FlashcardDTO;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.FlashcardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;
    private final UserRepository userRepository;
    private final AuthService authService;

    @PostMapping("/create")
    public ResponseEntity<FlashcardDTO> createFlashcard(@RequestBody Map<String, Object> request) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String front = (String) request.get("front");
            String back = (String) request.get("back");
            String sourceContent = (String) request.get("sourceContent");
            String deckName = (String) request.getOrDefault("deckName", "General");

            Long documentId = null;
            if (request.get("documentId") != null) {
                documentId = Long.valueOf(request.get("documentId").toString());
            }

            FlashcardDTO flashcard = flashcardService.createFlashcard(
                    front, back, sourceContent, deckName, documentId, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(flashcard);

        } catch (Exception e) {
            log.error("Failed to create flashcard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-cards")
    public ResponseEntity<Page<FlashcardDTO>> getUserFlashcards(Pageable pageable) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(flashcardService.getUserFlashcards(userId, pageable));
        } catch (Exception e) {
            log.error("Failed to fetch user flashcards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/deck/{deckName}")
    public ResponseEntity<Page<FlashcardDTO>> getFlashcardsByDeck(
            @PathVariable String deckName, Pageable pageable) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(flashcardService.getFlashcardsByDeck(userId, deckName, pageable));
        } catch (Exception e) {
            log.error("Failed to fetch flashcards for deck: {}", deckName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/due")
    public ResponseEntity<List<FlashcardDTO>> getDueFlashcards() {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(flashcardService.getDueFlashcards(userId));
        } catch (Exception e) {
            log.error("Failed to fetch due flashcards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{flashcardId}/review")
    public ResponseEntity<FlashcardDTO> reviewFlashcard(
            @PathVariable Long flashcardId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer quality = request.get("quality");
            if (quality == null || quality < 0 || quality > 5) {
                log.warn("Invalid quality score for flashcard review: {}", quality);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            Long userId = authService.getAuthenticatedUserId();

            // Ownership check: a user must not be able to update another user's
            // SM-2 schedule by guessing or enumerating flashcard IDs.
            if (!flashcardService.isOwnedByUser(flashcardId, userId)) {
                log.warn("User {} attempted to review flashcard {} they do not own",
                        userId, flashcardId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(flashcardService.reviewFlashcard(flashcardId, quality));

        } catch (Exception e) {
            log.error("Failed to submit review for flashcard ID: {}", flashcardId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long flashcardId) {
        try {
            Long userId = authService.getAuthenticatedUserId();

            if (!flashcardService.isOwnedByUser(flashcardId, userId)) {
                log.warn("User {} attempted to delete flashcard {} they do not own",
                        userId, flashcardId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            flashcardService.deleteFlashcard(flashcardId);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Failed to delete flashcard ID: {}", flashcardId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<FlashcardDTO>> getFlashcardsByDocument(@PathVariable Long documentId) {
        try {
            return ResponseEntity.ok(flashcardService.getFlashcardsByDocument(documentId));
        } catch (Exception e) {
            log.error("Failed to fetch flashcards for document ID: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/deck/{deckName}/study")
    public ResponseEntity<List<FlashcardDTO>> getEntireDeckForStudy(@PathVariable String deckName) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(flashcardService.getEntireDeckForStudy(userId, deckName));
        } catch (Exception e) {
            log.error("Failed to fetch entire deck for study: {}", deckName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}