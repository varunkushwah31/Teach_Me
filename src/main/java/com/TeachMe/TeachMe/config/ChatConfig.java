package com.TeachMe.TeachMe.config;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatConfig {

    @Bean
    public ChatMemory chatMemory() {
        // Spring AI 2.0+ uses a sliding window memory manager backed by an in-memory repository by default
        return MessageWindowChatMemory.builder()
                .maxMessages(50) // Keeps the last 50 messages to prevent token overflow
                .build();
    }
}