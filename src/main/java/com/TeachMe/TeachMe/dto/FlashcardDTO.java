package com.TeachMe.TeachMe.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Flashcard data transfer object for study cards with SM-2 spaced repetition scheduling")
public class FlashcardDTO {
    @Schema(description = "Unique identifier of the flashcard", example = "1")
    private Long id;

    @NotBlank(message = "Front text is required")
    @Size(max = 5000, message = "Front text must not exceed 5000 characters")
    @Schema(description = "Question or prompt side of the flashcard", example = "What is the capital of France?")
    private String front;

    @NotBlank(message = "Back text is required")
    @Size(max = 5000, message = "Back text must not exceed 5000 characters")
    @Schema(description = "Answer side of the flashcard", example = "Paris")
    private String back;

    @Size(max = 10000, message = "Source content must not exceed 10000 characters")
    @Schema(description = "Original source text or context for the flashcard", example = "Paris is the capital city of France.")
    private String sourceContent;

    @Schema(description = "Number of times this card has been reviewed", example = "3")
    private Integer repetitionCount;

    @Schema(description = "SM-2 algorithm ease factor (default 2.5)", example = "2.5")
    private Double easeFactor;

    @Schema(description = "Current interval in days before next review", example = "7")
    private Integer intervalDays;

    @Schema(description = "Next scheduled review date", example = "2025-01-15T10:30:00")
    private LocalDateTime nextReviewDate;

    @NotBlank(message = "Deck name is required")
    @Size(max = 100, message = "Deck name must not exceed 100 characters")
    @Schema(description = "Name of the deck this flashcard belongs to", example = "French Vocabulary")
    private String deckName;

    @Schema(description = "Associated document ID", example = "42")
    private Long documentId;

    @Schema(description = "Associated document name", example = "French Basics.pdf")
    private String documentName;
}

