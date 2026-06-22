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
public class QuizDTO {
    private Long id;
    private String title;
    private String description;
    private Integer totalQuestions;
    private Integer passScore;
    private List<QuizQuestionDTO> questions;
    private Long documentId;
    private String documentName;
}

