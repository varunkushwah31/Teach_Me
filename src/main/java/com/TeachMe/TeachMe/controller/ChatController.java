package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "AI Chat", description = "Endpoints for RAG (Retrieval-Augmented Generation) chat sessions.")
public class ChatController {

    private final RagChatService chatService;
    private final AuthService authService;

    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamQuestion(@RequestBody Map<String, String> payload) {

        String question = payload.get("question");
        String chatId = payload.getOrDefault("chatId", "default-session");

        if (question == null || question.trim().isEmpty()) {
            return Flux.just("Error: Question cannot be empty.");
        }

        // 1. Controller only extracts the identity
        Long userId = authService.getAuthenticatedUserId();

        // 2. Delegate everything else to the Service layer
        return chatService.askQuestionStream(question, chatId, userId)
                .onErrorResume(e -> {
                    log.error("Failed to process chat stream request", e);
                    return Flux.just("Error: Failed to connect to the AI. Please try again.");
                });
    }
}