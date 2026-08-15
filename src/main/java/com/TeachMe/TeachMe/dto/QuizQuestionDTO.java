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
@Schema(description = "Individual quiz question with multiple choice options and explanation")
public class QuizQuestionDTO {
    @Schema(description = "Unique identifier of the question", example = "1")
    private Long id;

    @Schema(description = "The question text", example = "What is the powerhouse of the cell?")
    private String questionText;

    @Schema(description = "Order/sequence number of the question in the quiz", example = "1")
    private Integer questionOrder;

    @Schema(description = "List of answer options (A, B, C, D)", example = "[\"Mitochondria\", \"Nucleus\", \"Ribosome\", \"Chloroplast\"]")
    private List<String> options;

    @Schema(description = "Zero-based index of the correct answer in the options list", example = "0")
    private Integer correctAnswerIndex;

    @Schema(description = "Explanation of why the correct answer is right", example = "Mitochondria generate ATP through cellular respiration")
    private String explanation;
}

