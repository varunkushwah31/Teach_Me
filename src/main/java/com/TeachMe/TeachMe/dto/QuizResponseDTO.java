package com.TeachMe.TeachMe.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Quiz submission response with score and detailed feedback")
public class QuizResponseDTO {
    @Schema(description = "Quiz ID that was submitted", example = "1")
    private Long quizId;

    @Schema(description = "List of user's selected answer indices (0-based) for each question")
    private List<Integer> userAnswers;

    @Schema(description = "Total number of questions in the quiz", example = "10")
    private Integer totalQuestions;

    @Schema(description = "Number of correctly answered questions", example = "8")
    private Integer correctAnswers;

    @Schema(description = "Score as percentage", example = "80.0")
    private Double score;

    @Schema(description = "Whether the user passed the quiz", example = "true")
    private Boolean passed;

    @Schema(description = "Detailed feedback for each question")
    private List<QuizFeedbackDTO> feedback;
}

