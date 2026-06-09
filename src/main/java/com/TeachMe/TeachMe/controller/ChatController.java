package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final RagChatService chatService;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askQuestion(@RequestBody Map<String, String> payload) {
        try {
            String question = payload.get("question");

            // Extract the chatId from the request. If missing, assign "default-session"
            String chatId = payload.getOrDefault("chatId", "default-session");

            if (question == null || question.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty."));
            }

            String answer = chatService.askQuestion(question, chatId);

            // Return both the answer AND the chatId so the frontend knows which session it is using
            return ResponseEntity.ok(Map.of(
                    "answer", answer,
                    "chatId", chatId
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}