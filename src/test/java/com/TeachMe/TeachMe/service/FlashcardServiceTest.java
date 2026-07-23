package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.FlashcardDTO;
import com.TeachMe.TeachMe.entity.Flashcard;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.repository.FlashcardRepository;
import com.TeachMe.TeachMe.service.impl.FlashcardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlashcardServiceTest {

    @Mock
    private FlashcardRepository flashcardRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private com.TeachMe.TeachMe.repository.FlashcardReviewLogRepository reviewLogRepository;

    @InjectMocks
    private FlashcardServiceImpl flashcardService;

    private User testUser;
    private Flashcard testCard;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .build();

        testCard = Flashcard.builder()
                .id(100L)
                .front("What is RAG?")
                .back("Retrieval-Augmented Generation")
                .sourceContent("Source text")
                .deckName("AI")
                .user(testUser)
                .repetitionCount(0)
                .easeFactor(2.5)
                .intervalDays(1)
                .nextReviewDate(LocalDateTime.now())
                .build();
    }

    @Test
    void shouldVerifyCardOwnershipCorrectly() {
        when(flashcardRepository.findById(100L)).thenReturn(Optional.of(testCard));
        when(flashcardRepository.findById(999L)).thenReturn(Optional.empty());

        assertTrue(flashcardService.isOwnedByUser(100L, 1L));
        assertFalse(flashcardService.isOwnedByUser(100L, 2L));
        assertFalse(flashcardService.isOwnedByUser(999L, 1L));
    }

    @Test
    void shouldResetIntervalOnLowQualityReview() {
        testCard.setRepetitionCount(3);
        testCard.setIntervalDays(10);
        when(flashcardRepository.findById(100L)).thenReturn(Optional.of(testCard));
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(i -> i.getArgument(0));

        FlashcardDTO result = flashcardService.reviewFlashcard(100L, 2);

        assertEquals(0, result.getRepetitionCount());
        assertEquals(1, result.getIntervalDays());
        assertTrue(result.getEaseFactor() < 2.5);
    }

    @Test
    void shouldIncreaseIntervalOnHighQualityReview() {
        when(flashcardRepository.findById(100L)).thenReturn(Optional.of(testCard));
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(i -> i.getArgument(0));

        FlashcardDTO result1 = flashcardService.reviewFlashcard(100L, 5);
        assertEquals(1, result1.getRepetitionCount());
        assertEquals(1, result1.getIntervalDays());

        FlashcardDTO result2 = flashcardService.reviewFlashcard(100L, 5);
        assertEquals(2, result2.getRepetitionCount());
        assertEquals(3, result2.getIntervalDays());
    }

    @Test
    void shouldCreateFlashcardSuccessfully() {
        when(flashcardRepository.save(any(Flashcard.class))).thenAnswer(i -> {
            Flashcard c = i.getArgument(0);
            c.setId(101L);
            return c;
        });

        FlashcardDTO dto = flashcardService.createFlashcard(
                "Front text", "Back text", "Source", "Deck 1", null, testUser
        );

        assertNotNull(dto);
        assertEquals(101L, dto.getId());
        assertEquals("Front text", dto.getFront());
        assertEquals("Deck 1", dto.getDeckName());
    }
}
