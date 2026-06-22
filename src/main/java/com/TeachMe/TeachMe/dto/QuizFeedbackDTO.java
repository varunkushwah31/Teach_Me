package com.TeachMe.TeachMe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizFeedbackDTO {
    private Integer questionIndex;
    private String questionText;
    private Integer userAnswer;
    private Integer correctAnswer;
    private Boolean isCorrect;
    private String explanation;
}

