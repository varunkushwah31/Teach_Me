package com.TeachMe.TeachMe.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Details about a supported AI model for college learning tasks")
public record AiModelInfoDTO(
        @Schema(description = "Unique model identifier", example = "llama-3.3-70b-versatile")
        String id,

        @Schema(description = "Human-readable model name", example = "Llama 3.3 70B Versatile")
        String name,

        @Schema(description = "Associated AI provider", example = "groq")
        String provider,

        @Schema(description = "Recommended academic use case", example = "Fast high-quality tutoring and reasoning")
        String description
) {}
