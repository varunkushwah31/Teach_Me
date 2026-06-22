package com.TeachMe.TeachMe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResponseDTO {
    private Long quizId;
    private List<Integer> userAnswers; // Index of selected answer for each question
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double score; // Percentage
    private Boolean passed;
    private List<QuizFeedbackDTO> feedback;
}

