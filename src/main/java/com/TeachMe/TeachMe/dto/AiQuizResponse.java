package com.TeachMe.TeachMe.dto;

import java.util.List;

public record AiQuizResponse(
        String title,
        String description,
        List<QuestionItem> questions
) {
    public record QuestionItem(
            String questionText,
            List<String> options,
            int correctAnswerIndex,
            String explanation
    ) {}
}