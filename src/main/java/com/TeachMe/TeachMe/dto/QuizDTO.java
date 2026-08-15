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
@Schema(description = "Quiz data transfer object containing questions and metadata for assessments")
public class QuizDTO {
    @Schema(description = "Unique identifier of the quiz", example = "1")
    private Long id;

    @Schema(description = "Title of the quiz", example = "Chapter 1: Introduction to Biology")
    private String title;

    @Schema(description = "Brief description of the quiz content", example = "Covers basic cell biology concepts")
    private String description;

    @Schema(description = "Total number of questions in the quiz", example = "10")
    private Integer totalQuestions;

    @Schema(description = "Minimum score required to pass (percentage)", example = "70")
    private Integer passScore;

    @Schema(description = "List of quiz questions with options and answers")
    private List<QuizQuestionDTO> questions;

    @Schema(description = "Source document ID this quiz was generated from", example = "5")
    private Long documentId;

    @Schema(description = "Source document name", example = "Biology Textbook Chapter 1.pdf")
    private String documentName;
}

