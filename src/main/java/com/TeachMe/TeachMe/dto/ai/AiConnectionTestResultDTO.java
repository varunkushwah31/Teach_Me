package com.TeachMe.TeachMe.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Diagnostic result of testing connectivity with an AI provider")
public record AiConnectionTestResultDTO(
        @Schema(description = "Whether the target AI endpoint is reachable and authenticating successfully", example = "true")
        boolean success,

        @Schema(description = "Provider tested", example = "groq")
        String provider,

        @Schema(description = "Status summary or error details", example = "Connected successfully to Groq API")
        String message,

        @Schema(description = "Round-trip network latency in milliseconds", example = "128")
        Long latencyMs,

        @Schema(description = "List of model IDs available from this provider")
        List<String> availableModels
) {
    public static AiConnectionTestResultDTO success(String provider, String message, Long latencyMs, List<String> models) {
        return new AiConnectionTestResultDTO(true, provider, message, latencyMs, models);
    }

    public static AiConnectionTestResultDTO failure(String provider, String message) {
        return new AiConnectionTestResultDTO(false, provider, message, null, List.of());
    }
}
