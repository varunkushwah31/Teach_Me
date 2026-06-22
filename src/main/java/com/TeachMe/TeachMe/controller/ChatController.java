package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final RagChatService chatService;
    private final UserRepository userRepository;
    private final AuthService authService;

    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamQuestion(@RequestBody Map<String, String> payload) {

        String question = payload.get("question");
        String chatId = payload.getOrDefault("chatId", "default-session");

        if (question == null || question.trim().isEmpty()) {
            return Flux.just("Error: Question cannot be empty.");
        }

        // 1. Wrap the blocking database and auth calls in a reactive Mono on an elastic thread
        return Mono.fromCallable(() -> {
                    Long userId = authService.getAuthenticatedUserId();
                    return userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                })
                .subscribeOn(Schedulers.boundedElastic()) // Safely handles the blocking JPA call
                .flatMapMany(currentUser ->
                        // 2. Once the user is fetched safely, start the AI stream
                        chatService.askQuestionStream(question, chatId, currentUser)
                )
                .onErrorResume(e -> {
                    log.error("Failed to process chat stream request", e);
                    return Flux.just("Error: Failed to connect to the AI. Please try again.");
                });
    }
}