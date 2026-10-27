package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ai.AiConnectionTestResultDTO;
import com.TeachMe.TeachMe.dto.ai.AiModelInfoDTO;
import com.TeachMe.TeachMe.dto.ai.AiProviderConfigDTO;
import com.TeachMe.TeachMe.service.ExternalAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Provider Management", description = "Endpoints for configuring and testing external AI providers (OpenAI, Groq, OpenRouter, DeepSeek, Gemini, Anthropic) and local Ollama.")
public class AiSettingsController {

    private final ExternalAiService externalAiService;

    @PostMapping("/test-connection")
    @Operation(summary = "Test AI provider connection", description = "Verifies API key validity, latency, and model availability for a chosen AI provider (OpenAI, Groq, OpenRouter, DeepSeek, Gemini, Anthropic, Ollama).")
    @ApiResponse(responseCode = "200", description = "Diagnostic check completed")
    public ResponseEntity<AiConnectionTestResultDTO> testConnection(@RequestBody AiProviderConfigDTO config) {
        AiConnectionTestResultDTO result = externalAiService.testConnection(config);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/models")
    @Operation(summary = "Get models for AI provider", description = "Lists supported and recommended models for college notes tutoring from the specified provider.")
    @ApiResponse(responseCode = "200", description = "Model list retrieved successfully")
    public ResponseEntity<List<AiModelInfoDTO>> getModels(
            @RequestParam(defaultValue = "ollama") String provider,
            @RequestParam(required = false) String baseUrl,
            @RequestParam(required = false) String apiKey) {
        List<AiModelInfoDTO> models = externalAiService.getAvailableModels(provider, baseUrl, apiKey);
        return ResponseEntity.ok(models);
    }

    @GetMapping("/config")
    @Operation(summary = "Get active server AI configuration", description = "Returns active server-level AI defaults and capability flags without exposing secret keys.")
    @ApiResponse(responseCode = "200", description = "Current configuration returned")
    public ResponseEntity<Map<String, Object>> getServerConfig() {
        AiProviderConfigDTO resolved = externalAiService.resolveConfig(null);
        return ResponseEntity.ok(Map.of(
                "activeProvider", resolved.resolvedProvider(),
                "defaultModel", resolved.model(),
                "baseUrl", resolved.baseUrl(),
                "isExternalConfigured", externalAiService.isExternalConfigured()
        ));
    }
}
