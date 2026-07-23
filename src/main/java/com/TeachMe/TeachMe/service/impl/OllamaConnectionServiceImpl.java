package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.OllamaConnectionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class OllamaConnectionServiceImpl implements OllamaConnectionService {

    private final RestClient restClient;

    public OllamaConnectionServiceImpl() {
        this.restClient = RestClient.builder().build();
    }

    @Override
    public Map<String, Object> testConnection(String baseUrl) {
        String url = normalizeBaseUrl(baseUrl);
        long startTime = System.currentTimeMillis();

        try {
            log.info("Testing connection to Ollama server at {}", url);
            Map<?, ?> response = restClient.get()
                    .uri(url + "/api/version")
                    .retrieve()
                    .body(Map.class);

            long latencyMs = System.currentTimeMillis() - startTime;
            String version = (response != null && response.containsKey("version")) 
                    ? String.valueOf(response.get("version")) 
                    : "v0.3.0+";

            return Map.of(
                    "status", "ONLINE",
                    "baseUrl", url,
                    "version", version,
                    "latencyMs", latencyMs,
                    "message", "Successfully connected to Ollama service"
            );
        } catch (Exception e) {
            log.warn("Failed to connect to Ollama server at {}: {}", url, e.getMessage());
            long latencyMs = System.currentTimeMillis() - startTime;
            return Map.of(
                    "status", "OFFLINE",
                    "baseUrl", url,
                    "version", "N/A",
                    "latencyMs", latencyMs,
                    "message", "Could not connect to Ollama daemon at " + url + ". Error: " + e.getMessage()
            );
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchAvailableModels(String baseUrl) {
        String url = normalizeBaseUrl(baseUrl);
        List<Map<String, Object>> modelsList = new ArrayList<>();

        try {
            log.info("Fetching installed models from Ollama server at {}", url);
            Map<String, Object> response = restClient.get()
                    .uri(url + "/api/tags")
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("models")) {
                List<Map<String, Object>> rawModels = (List<Map<String, Object>>) response.get("models");
                for (Map<String, Object> m : rawModels) {
                    String name = String.valueOf(m.getOrDefault("name", ""));
                    Object sizeObj = m.get("size");
                    long sizeBytes = (sizeObj instanceof Number n) ? n.longValue() : 0L;
                    double sizeGb = Math.round((sizeBytes / (1024.0 * 1024.0 * 1024.0)) * 10.0) / 10.0;

                    modelsList.add(Map.of(
                            "name", name,
                            "sizeGb", sizeGb,
                            "details", m.getOrDefault("details", Map.of())
                    ));
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch models from Ollama endpoint {}: {}", url, e.getMessage());
            // Fallback default list if Ollama is not actively running local tags
            modelsList.add(Map.of("name", "deepseek-r1:8b", "sizeGb", 4.9, "details", Map.of("family", "deepseek")));
            modelsList.add(Map.of("name", "qwen2.5:7b", "sizeGb", 4.7, "details", Map.of("family", "qwen")));
            modelsList.add(Map.of("name", "llama3.1:8b", "sizeGb", 4.7, "details", Map.of("family", "llama")));
        }

        if (modelsList.isEmpty()) {
            modelsList.add(Map.of("name", "deepseek-r1:8b", "sizeGb", 4.9, "details", Map.of("family", "deepseek")));
            modelsList.add(Map.of("name", "qwen2.5:7b", "sizeGb", 4.7, "details", Map.of("family", "qwen")));
            modelsList.add(Map.of("name", "llama3.1:8b", "sizeGb", 4.7, "details", Map.of("family", "llama")));
        }

        return modelsList;
    }

    private String normalizeBaseUrl(String inputUrl) {
        if (inputUrl == null || inputUrl.isBlank()) {
            return "http://localhost:11434";
        }
        String trimmed = inputUrl.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "http://" + trimmed;
        }
        if (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
