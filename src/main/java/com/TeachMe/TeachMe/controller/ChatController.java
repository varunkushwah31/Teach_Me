package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.RagChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Allows the frontend to connect
@RequiredArgsConstructor
public class ChatController {

    private final RagChatService chatService;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askQuestion(@RequestBody Map<String, String> payload) {
        try {
            String question = payload.get("question");

            // Prevent empty queries
            if (question == null || question.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty."));
            }

            String answer = chatService.askQuestion(question);

            // Return as JSON so the frontend can easily parse it
            return ResponseEntity.ok(Map.of("answer", answer));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}