package com.TeachMe.TeachMe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class OllamaHealthIndicator implements HealthIndicator {

    private final RestClient restClient;
    private final String baseUrl;

    private static final String VERSION_KEY = "version";

    public OllamaHealthIndicator(
            @Value("${spring.ai.ollama.base-url:http://localhost:11434}") String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(1500));
        requestFactory.setReadTimeout(Duration.ofMillis(1500));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(this.baseUrl)
                .build();
    }

    @Override
    public Health health() {
        try {
            Map<?, ?> response = restClient.get()
                    .uri("/api/" + VERSION_KEY)
                    .retrieve()
                    .body(Map.class);

            String version = (response != null && response.containsKey(VERSION_KEY))
                    ? String.valueOf(response.get(VERSION_KEY))
                    : "detected";

            return Health.up()
                    .withDetail("ollamaEndpoint", baseUrl)
                    .withDetail(VERSION_KEY, version)
                    .withDetail("status", "ONLINE")
                    .build();
        } catch (Exception e) {
            log.debug("Observability: Ollama ping returned inactive: {}", e.getMessage());
            // Return UP with offline notice or UNKNOWN so Render service health remains healthy while Ollama is offline or remote
            return Health.up()
                    .withDetail("ollamaEndpoint", baseUrl)
                    .withDetail("status", "STANDBY / REMOTE")
                    .withDetail("notice", "Ollama remote daemon offline or on-demand")
                    .build();
        }
    }
}
