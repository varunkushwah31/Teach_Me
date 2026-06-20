package com.TeachMe.TeachMe.dto;

import java.time.LocalDateTime;

public record ChatResponse(
        Long id,
        String sessionId,
        String question,
        String answer,
        LocalDateTime createdAt
) {}