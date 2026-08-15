package com.TeachMe.TeachMe.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health Check", description = "Simple endpoint to test backend and AI connectivity")
public class TestController {

    private final ChatClient chatClient;

    public TestController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/api/test")
    @Operation(summary = "Test AI connection", description = "Verifies backend and Ollama LLM connectivity by sending a test prompt")
    @ApiResponse(responseCode = "200", description = "Backend and AI are online")
    @ApiResponse(responseCode = "503", description = "AI service unavailable")
    public String testConnection() {
        return chatClient.prompt()
                .user("Say 'The backend is online.' and nothing else.")
                .call()
                .content();
    }
}