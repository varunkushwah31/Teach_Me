package com.TeachMe.TeachMe.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Configuration parameters for external and local AI providers")
public record AiProviderConfigDTO(
        @Schema(description = "Provider identifier (ollama, openai, groq, openrouter, deepseek, gemini, anthropic)", example = "groq")
        String provider,

        @Schema(description = "API authentication key for the external provider (optional for local Ollama)", example = "gsk_...")
        String apiKey,

        @Schema(description = "Base API URL for the provider endpoint", example = "https://api.groq.com/openai/v1")
        String baseUrl,

        @Schema(description = "Target LLM model identifier", example = "llama-3.3-70b-versatile")
        String model,

        @Schema(description = "Sampling temperature (0.0 to 1.0)", example = "0.7")
        Double temperature
) {
    public boolean hasCustomKey() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public boolean isExternal() {
        return provider != null && !provider.trim().equalsIgnoreCase("ollama");
    }

    public String resolvedProvider() {
        return provider != null && !provider.trim().isEmpty() ? provider.trim().toLowerCase() : "ollama";
    }
}
