package com.TeachMe.TeachMe.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    private final ChatClient chatClient;

    public TestController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/api/test")
    public String testConnection() {
        return chatClient.prompt()
                .user("Say 'The backend is online.' and nothing else.")
                .call()
                .content();
    }
}