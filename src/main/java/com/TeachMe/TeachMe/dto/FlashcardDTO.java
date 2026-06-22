package com.TeachMe.TeachMe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardDTO {
    private Long id;
    private String front;
    private String back;
    private String sourceContent;
    private Integer repetitionCount;
    private Double easeFactor;
    private Integer intervalDays;
    private LocalDateTime nextReviewDate;
    private String deckName;
    private Long documentId;
    private String documentName;
}

