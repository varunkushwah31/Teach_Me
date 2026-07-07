package com.TeachMe.TeachMe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OllamaHealthIndicator implements HealthIndicator {

    private final ChatClient chatClient;

    public OllamaHealthIndicator(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public Health health() {
        try {
            // Check Ollama connection with a simple ping prompt
            String response = chatClient.prompt()
                    .user("ping")
                    .call()
                    .content();
            if (response != null && !response.isBlank()) {
                return Health.up()
                        .withDetail("model", "deepseek-r1:8b")
                        .withDetail("status", "Reachable")
                        .build();
            }
            return Health.down().withDetail("error", "Empty response received from Ollama model").build();
        } catch (Exception e) {
            log.warn("Observability: Ollama is unreachable on health check request", e);
            return Health.down(e)
                    .withDetail("error", "Ollama server is offline or unreachable")
                    .build();
        }
    }
}
