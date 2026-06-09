package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final RagChatService chatService;

    //  Notice the 'produces' attribute. This tells Spring Boot to keep the connection open for SSE.
    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamQuestion(@RequestBody Map<String, String> payload) {

        String question = payload.get("question");
        String chatId = payload.getOrDefault("chatId", "default-session");

        if (question == null || question.trim().isEmpty()) {
            return Flux.just("Error: Question cannot be empty.");
        }

        // Return the reactive stream directly to the client
        return chatService.askQuestionStream(question, chatId);
    }
}