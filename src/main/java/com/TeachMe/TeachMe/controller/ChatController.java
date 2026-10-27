package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ai.AiProviderConfigDTO;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "AI Chat", description = "Endpoints for RAG (Retrieval-Augmented Generation) chat sessions with multi-provider External AI support.")
public class ChatController {

    private final RagChatService chatService;
    private final AuthService authService;

    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Ask question (streaming)", description = "Submits a question to the AI tutor and streams response chunks via SSE. Supports external AI providers (OpenAI, Groq, OpenRouter, DeepSeek, Gemini, Anthropic) or local Ollama.")
    @ApiResponse(responseCode = "200", description = "Real-time response stream initialized successfully")
    public Flux<String> streamQuestion(
            @RequestHeader(value = "X-AI-Provider", required = false) String headerProvider,
            @RequestHeader(value = "X-AI-Key", required = false) String headerApiKey,
            @RequestHeader(value = "X-AI-Model", required = false) String headerModel,
            @RequestHeader(value = "X-AI-Base-Url", required = false) String headerBaseUrl,
            @RequestBody Map<String, Object> payload) {

        String question = payload.get("question") != null ? payload.get("question").toString() : null;
        String chatId = payload.getOrDefault("chatId", "default-session").toString();
        java.util.List<Long> documentIds = parseDocumentIds(payload.get("documentIds"));

        if (question == null || question.trim().isEmpty()) {
            return Flux.just("Error: Question cannot be empty.");
        }

        String provider = payload.get("aiProvider") != null ? payload.get("aiProvider").toString()
                : (payload.get("provider") != null ? payload.get("provider").toString() : headerProvider);
        String apiKey = payload.get("apiKey") != null ? payload.get("apiKey").toString() : headerApiKey;
        String model = payload.get("aiModel") != null ? payload.get("aiModel").toString()
                : (payload.get("model") != null ? payload.get("model").toString() : headerModel);
        String baseUrl = payload.get("baseUrl") != null ? payload.get("baseUrl").toString() : headerBaseUrl;

        Double temperature = null;
        if (payload.get("temperature") != null) {
            try {
                temperature = Double.valueOf(payload.get("temperature").toString());
            } catch (Exception _) {
            }
        }

        AiProviderConfigDTO aiConfig = new AiProviderConfigDTO(provider, apiKey, baseUrl, model, temperature);

        Long userId = authService.getAuthenticatedUserId();

        Flux<String> responseStream = (aiConfig.hasCustomKey() || aiConfig.isExternal())
                ? chatService.askQuestionStream(question, chatId, userId, documentIds, aiConfig)
                : chatService.askQuestionStream(question, chatId, userId, documentIds);

        return responseStream
                .onErrorResume(e -> {
                    log.error("Failed to process chat stream request", e);
                    return Flux.just("Error: Failed to connect to the AI. " + e.getMessage());
                });
    }

    private java.util.List<Long> parseDocumentIds(Object docIdsObj) {
        if (docIdsObj instanceof java.util.List<?> list) {
            java.util.List<Long> result = new java.util.ArrayList<>();
            for (Object item : list) {
                try {
                    result.add(Long.valueOf(item.toString()));
                } catch (Exception _) {
                    // Ignore non-numeric document IDs in the list
                }
            }
            return result;
        }
        return java.util.Collections.emptyList();
    }
}
