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
public class QuizQuestionDTO {
    private Long id;
    private String questionText;
    private Integer questionOrder;
    private List<String> options;
    private Integer correctAnswerIndex;
    private String explanation;
}

