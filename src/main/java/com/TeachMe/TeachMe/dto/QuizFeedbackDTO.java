package com.TeachMe.TeachMe.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Feedback for a single quiz question showing user's answer vs correct answer")
public class QuizFeedbackDTO {
    @Schema(description = "Zero-based index of the question in the quiz", example = "0")
    private Integer questionIndex;

    @Schema(description = "The question text", example = "What is the capital of France?")
    private String questionText;

    @Schema(description = "User's selected answer index (0-based)", example = "1")
    private Integer userAnswer;

    @Schema(description = "Correct answer index (0-based)", example = "0")
    private Integer correctAnswer;

    @Schema(description = "Whether the user's answer was correct", example = "false")
    private Boolean isCorrect;

    @Schema(description = "Explanation of the correct answer", example = "Paris is the capital city of France.")
    private String explanation;
}

