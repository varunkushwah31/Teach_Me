package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final RagChatService chatService;
    private final UserRepository userRepository;

    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamQuestion(@RequestBody Map<String, String> payload) {

        String question = payload.get("question");
        String chatId = payload.getOrDefault("chatId", "default-session");
        String category = payload.getOrDefault("category", "all");

        if (question == null || question.trim().isEmpty()) {
            return Flux.just("Error: Question cannot be empty.");
        }

        // 1. Get the currently logged-in user from the JWT Security Context
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();

        // 2. Wrap the blocking database call in a reactive Mono on an elastic thread
        return Mono.fromCallable(() -> userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new RuntimeException("User not found")))
                .subscribeOn(Schedulers.boundedElastic()) // Safely handles the blocking JPA call
                .flatMapMany(currentUser ->
                        // 3. Once the user is fetched, start the AI stream
                        chatService.askQuestionStream(question, chatId, category, currentUser)
                );
    }
}