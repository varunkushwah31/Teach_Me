package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.dto.ai.AiConnectionTestResultDTO;
import com.TeachMe.TeachMe.dto.ai.AiModelInfoDTO;
import com.TeachMe.TeachMe.dto.ai.AiProviderConfigDTO;
import com.TeachMe.TeachMe.service.ExternalAiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.*;

@Slf4j
@Service
public class ExternalAiServiceImpl implements ExternalAiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${application.ai.default-provider:ollama}")
    private String serverDefaultProvider;

    @Value("${application.ai.api-key:}")
    private String serverApiKey;

    @Value("${application.ai.base-url:}")
    private String serverBaseUrl;

    @Value("${application.ai.model:}")
    private String serverModel;

    @Value("${application.ai.temperature:0.7}")
    private double serverTemperature;

    private static final Map<String, String> DEFAULT_BASE_URLS = Map.of(
            "openai", "https://api.openai.com/v1",
            "groq", "https://api.groq.com/openai/v1",
            "openrouter", "https://openrouter.ai/api/v1",
            "deepseek", "https://api.deepseek.com/v1",
            "gemini", "https://generativelanguage.googleapis.com/v1beta/openai",
            "anthropic", "https://api.anthropic.com/v1",
            "ollama", "http://localhost:11434"
    );

    private static final Map<String, String> DEFAULT_MODELS = Map.of(
            "openai", "gpt-4o-mini",
            "groq", "llama-3.3-70b-versatile",
            "openrouter", "deepseek/deepseek-r1",
            "deepseek", "deepseek-chat",
            "gemini", "gemini-2.0-flash",
            "anthropic", "claude-3-5-sonnet-20241022",
            "ollama", "deepseek-r1:8b"
    );

    public ExternalAiServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean isExternalConfigured() {
        return serverDefaultProvider != null && !serverDefaultProvider.trim().equalsIgnoreCase("ollama")
                && serverApiKey != null && !serverApiKey.trim().isEmpty();
    }

    @Override
    public AiProviderConfigDTO resolveConfig(AiProviderConfigDTO requestConfig) {
        if (requestConfig != null && requestConfig.hasCustomKey()) {
            String provider = requestConfig.resolvedProvider();
            String baseUrl = (requestConfig.baseUrl() != null && !requestConfig.baseUrl().isBlank())
                    ? requestConfig.baseUrl().trim()
                    : DEFAULT_BASE_URLS.getOrDefault(provider, DEFAULT_BASE_URLS.get("openai"));
            String model = (requestConfig.model() != null && !requestConfig.model().isBlank())
                    ? requestConfig.model().trim()
                    : DEFAULT_MODELS.getOrDefault(provider, "gpt-4o-mini");
            Double temp = requestConfig.temperature() != null ? requestConfig.temperature() : 0.7;
            return new AiProviderConfigDTO(provider, requestConfig.apiKey().trim(), baseUrl, model, temp);
        }

        if (isExternalConfigured()) {
            String provider = serverDefaultProvider.trim().toLowerCase();
            String baseUrl = (serverBaseUrl != null && !serverBaseUrl.isBlank())
                    ? serverBaseUrl.trim()
                    : DEFAULT_BASE_URLS.getOrDefault(provider, DEFAULT_BASE_URLS.get("openai"));
            String model = (serverModel != null && !serverModel.isBlank())
                    ? serverModel.trim()
                    : DEFAULT_MODELS.getOrDefault(provider, "gpt-4o-mini");
            return new AiProviderConfigDTO(provider, serverApiKey.trim(), baseUrl, model, serverTemperature);
        }

        String provider = (requestConfig != null && requestConfig.provider() != null)
                ? requestConfig.resolvedProvider()
                : "ollama";
        String baseUrl = (requestConfig != null && requestConfig.baseUrl() != null && !requestConfig.baseUrl().isBlank())
                ? requestConfig.baseUrl().trim()
                : DEFAULT_BASE_URLS.getOrDefault(provider, "http://localhost:11434");
        String model = (requestConfig != null && requestConfig.model() != null && !requestConfig.model().isBlank())
                ? requestConfig.model().trim()
                : DEFAULT_MODELS.getOrDefault(provider, "deepseek-r1:8b");
        Double temp = (requestConfig != null && requestConfig.temperature() != null) ? requestConfig.temperature() : 0.7;

        return new AiProviderConfigDTO(provider, null, baseUrl, model, temp);
    }

    @Override
    public Flux<String> streamChat(String systemPrompt, String userPrompt, AiProviderConfigDTO config) {
        AiProviderConfigDTO resolved = resolveConfig(config);
        String provider = resolved.resolvedProvider();

        log.info("Streaming chat request via External AI provider='{}' model='{}'", provider, resolved.model());

        if ("anthropic".equalsIgnoreCase(provider) && (resolved.baseUrl() == null || resolved.baseUrl().contains("anthropic.com"))) {
            return streamAnthropicMessages(systemPrompt, userPrompt, resolved);
        }

        return streamOpenAiCompatible(systemPrompt, userPrompt, resolved);
    }

    @Override
    public String generateText(String systemPrompt, String userPrompt, AiProviderConfigDTO config) {
        AiProviderConfigDTO resolved = resolveConfig(config);
        String provider = resolved.resolvedProvider();

        if ("anthropic".equalsIgnoreCase(provider) && (resolved.baseUrl() == null || resolved.baseUrl().contains("anthropic.com"))) {
            return generateAnthropicSync(systemPrompt, userPrompt, resolved);
        }

        return generateOpenAiCompatibleSync(systemPrompt, userPrompt, resolved);
    }

    private Flux<String> streamOpenAiCompatible(String systemPrompt, String userPrompt, AiProviderConfigDTO config) {
        String endpoint = buildChatCompletionsUrl(config.baseUrl());

        Map<String, Object> requestBody = Map.of(
                "model", config.model(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt != null ? systemPrompt : ""),
                        Map.of("role", "user", "content", userPrompt != null ? userPrompt : "")
                ),
                "stream", true,
                "temperature", config.temperature() != null ? config.temperature() : 0.7
        );

        WebClient.RequestBodySpec requestSpec = webClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON);

        if (config.hasCustomKey()) {
            requestSpec.header(HttpHeaders.AUTHORIZATION, "Bearer " + config.apiKey().trim());
        }

        if ("openrouter".equalsIgnoreCase(config.provider())) {
            requestSpec.header("HTTP-Referer", "https://teachme.ai");
            requestSpec.header("X-Title", "TeachMe College Notes RAG");
        }

        return requestSpec
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .timeout(Duration.ofSeconds(60))
                .flatMap(chunk -> Flux.fromArray(chunk.split("\n")))
                .map(String::trim)
                .filter(line -> line.startsWith("data:"))
                .map(line -> line.substring(5).trim())
                .filter(payload -> !payload.isEmpty() && !"[DONE]".equals(payload))
                .mapNotNull(this::extractContentFromDelta)
                .onErrorResume(e -> {
                    log.error("External AI stream error ({}: {}): {}", config.provider(), config.model(), e.getMessage());
                    return Flux.just("\n[Error connecting to " + config.provider().toUpperCase() + " AI: " + e.getMessage() + "]");
                });
    }

    private String extractContentFromDelta(String jsonChunk) {
        try {
            JsonNode root = objectMapper.readTree(jsonChunk);
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && !choices.isEmpty()) {
                JsonNode delta = choices.get(0).get("delta");
                if (delta != null && delta.has("content") && !delta.get("content").isNull()) {
                    return delta.get("content").asText();
                }
            }
        } catch (Exception e) {
            log.debug("Skipping unparseable SSE chunk: {}", jsonChunk);
        }
        return null;
    }

    private Flux<String> streamAnthropicMessages(String systemPrompt, String userPrompt, AiProviderConfigDTO config) {
        String endpoint = "https://api.anthropic.com/v1/messages";

        Map<String, Object> requestBody = Map.of(
                "model", config.model(),
                "max_tokens", 4096,
                "system", systemPrompt != null ? systemPrompt : "",
                "messages", List.of(Map.of("role", "user", "content", userPrompt != null ? userPrompt : "")),
                "stream", true,
                "temperature", config.temperature() != null ? config.temperature() : 0.7
        );

        return webClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .header("x-api-key", config.apiKey().trim())
                .header("anthropic-version", "2023-06-01")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .timeout(Duration.ofSeconds(60))
                .flatMap(chunk -> Flux.fromArray(chunk.split("\n")))
                .map(String::trim)
                .filter(line -> line.startsWith("data:"))
                .map(line -> line.substring(5).trim())
                .filter(payload -> !payload.isEmpty())
                .mapNotNull(this::extractAnthropicDelta)
                .onErrorResume(e -> {
                    log.error("Anthropic stream error: {}", e.getMessage());
                    return Flux.just("\n[Error connecting to Anthropic AI: " + e.getMessage() + "]");
                });
    }

    private String extractAnthropicDelta(String jsonChunk) {
        try {
            JsonNode root = objectMapper.readTree(jsonChunk);
            String type = root.path("type").asText();
            if ("content_block_delta".equals(type)) {
                JsonNode delta = root.get("delta");
                if (delta != null && delta.has("text")) {
                    return delta.get("text").asText();
                }
            }
        } catch (Exception e) {
            log.debug("Skipping non-delta Anthropic event");
        }
        return null;
    }

    private String generateOpenAiCompatibleSync(String systemPrompt, String userPrompt, AiProviderConfigDTO config) {
        String endpoint = buildChatCompletionsUrl(config.baseUrl());

        Map<String, Object> requestBody = Map.of(
                "model", config.model(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt != null ? systemPrompt : ""),
                        Map.of("role", "user", "content", userPrompt != null ? userPrompt : "")
                ),
                "stream", false,
                "temperature", config.temperature() != null ? config.temperature() : 0.7
        );

        WebClient.RequestBodySpec requestSpec = webClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON);

        if (config.hasCustomKey()) {
            requestSpec.header(HttpHeaders.AUTHORIZATION, "Bearer " + config.apiKey().trim());
        }

        try {
            String rawJson = requestSpec
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(45));

            if (rawJson != null) {
                JsonNode root = objectMapper.readTree(rawJson);
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && !choices.isEmpty()) {
                    JsonNode message = choices.get(0).get("message");
                    if (message != null && message.has("content")) {
                        return message.get("content").asText();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Sync AI generation failure on {}: {}", config.provider(), e.getMessage());
            throw new RuntimeException("External AI generation failed: " + e.getMessage(), e);
        }
        return "";
    }

    private String generateAnthropicSync(String systemPrompt, String userPrompt, AiProviderConfigDTO config) {
        String endpoint = "https://api.anthropic.com/v1/messages";

        Map<String, Object> requestBody = Map.of(
                "model", config.model(),
                "max_tokens", 4096,
                "system", systemPrompt != null ? systemPrompt : "",
                "messages", List.of(Map.of("role", "user", "content", userPrompt != null ? userPrompt : "")),
                "stream", false
        );

        try {
            String rawJson = webClient.post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-api-key", config.apiKey().trim())
                    .header("anthropic-version", "2023-06-01")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(45));

            if (rawJson != null) {
                JsonNode root = objectMapper.readTree(rawJson);
                JsonNode content = root.get("content");
                if (content != null && content.isArray() && !content.isEmpty()) {
                    return content.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Anthropic sync error: {}", e.getMessage());
            throw new RuntimeException("Anthropic generation failed: " + e.getMessage(), e);
        }
        return "";
    }

    @Override
    public AiConnectionTestResultDTO testConnection(AiProviderConfigDTO config) {
        String provider = config.resolvedProvider();
        String baseUrl = (config.baseUrl() != null && !config.baseUrl().isBlank())
                ? config.baseUrl().trim()
                : DEFAULT_BASE_URLS.getOrDefault(provider, DEFAULT_BASE_URLS.get("openai"));
        String apiKey = config.apiKey() != null ? config.apiKey().trim() : "";

        long start = System.currentTimeMillis();

        if ("ollama".equalsIgnoreCase(provider)) {
            return testOllamaConnection(baseUrl, start);
        }

        if (apiKey.isEmpty() || apiKey.length() < 6) {
            return AiConnectionTestResultDTO.failure(provider, "API Key is required for provider: " + provider.toUpperCase());
        }

        try {
            if ("gemini".equalsIgnoreCase(provider)) {
                String testUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
                webClient.get().uri(testUrl).retrieve().toBodilessEntity().block(Duration.ofSeconds(8));
                long latency = System.currentTimeMillis() - start;
                List<String> models = getAvailableModels(provider, baseUrl, apiKey).stream().map(AiModelInfoDTO::id).toList();
                return AiConnectionTestResultDTO.success(provider, "Connected successfully to Google Gemini API", latency, models);
            }

            if ("anthropic".equalsIgnoreCase(provider)) {
                if (apiKey.startsWith("sk-ant-")) {
                    List<String> models = getAvailableModels(provider, baseUrl, apiKey).stream().map(AiModelInfoDTO::id).toList();
                    return AiConnectionTestResultDTO.success(provider, "Anthropic API key format verified and ready", 15L, models);
                }
                return AiConnectionTestResultDTO.failure(provider, "Invalid Anthropic API key format (must start with sk-ant-)");
            }

            String modelsUrl = buildModelsUrl(baseUrl);
            WebClient.RequestHeadersSpec<?> spec = webClient.get()
                    .uri(modelsUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);

            if ("openrouter".equalsIgnoreCase(provider)) {
                spec.header("HTTP-Referer", "https://teachme.ai");
                spec.header("X-Title", "TeachMe College RAG");
            }

            String response = spec.retrieve().bodyToMono(String.class).block(Duration.ofSeconds(8));
            long latency = System.currentTimeMillis() - start;

            List<String> liveModels = parseModelIds(response);
            if (liveModels.isEmpty()) {
                liveModels = getAvailableModels(provider, baseUrl, apiKey).stream().map(AiModelInfoDTO::id).toList();
            }

            return AiConnectionTestResultDTO.success(provider, "Connected successfully to " + provider.toUpperCase() + " API", latency, liveModels);

        } catch (Exception e) {
            log.warn("External AI connection test failed for {}: {}", provider, e.getMessage());
            return AiConnectionTestResultDTO.failure(provider, "Connection test failed: " + e.getMessage());
        }
    }

    private AiConnectionTestResultDTO testOllamaConnection(String baseUrl, long start) {
        String cleanUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        try {
            webClient.get()
                    .uri(cleanUrl + "/api/version")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(5));

            long latency = System.currentTimeMillis() - start;
            List<String> models = getAvailableModels("ollama", cleanUrl, "").stream().map(AiModelInfoDTO::id).toList();
            return AiConnectionTestResultDTO.success("ollama", "Connected to local Ollama daemon", latency, models);
        } catch (Exception e) {
            return AiConnectionTestResultDTO.failure("ollama", "Ollama daemon unreachable at " + cleanUrl + ": " + e.getMessage());
        }
    }

    private List<String> parseModelIds(String modelsJson) {
        List<String> ids = new ArrayList<>();
        if (modelsJson == null) return ids;
        try {
            JsonNode root = objectMapper.readTree(modelsJson);
            JsonNode data = root.get("data");
            if (data != null && data.isArray()) {
                for (JsonNode item : data) {
                    if (item.has("id")) {
                        ids.add(item.get("id").asText());
                    }
                }
            }
        } catch (Exception _) {
            // Ignore parse errors on raw model catalogs
        }
        return ids;
    }

    @Override
    public List<AiModelInfoDTO> getAvailableModels(String provider, String baseUrl, String apiKey) {
        String normProvider = provider != null ? provider.trim().toLowerCase() : "ollama";

        return switch (normProvider) {
            case "groq" -> List.of(
                    new AiModelInfoDTO("llama-3.3-70b-versatile", "Llama 3.3 70B Versatile", "groq", "Fastest reasoning model for college notes & exam preparation"),
                    new AiModelInfoDTO("deepseek-r1-distill-llama-70b", "DeepSeek R1 Distill 70B", "groq", "High-depth mathematical and algorithmic derivations"),
                    new AiModelInfoDTO("mixtral-8x7b-32768", "Mixtral 8x7B (32k Context)", "groq", "Long-form textbook & reading comprehension"),
                    new AiModelInfoDTO("gemma2-9b-it", "Gemma 2 9B Instruct", "groq", "Lightweight study companion for flashcards & quizzes")
            );
            case "openai" -> List.of(
                    new AiModelInfoDTO("gpt-4o-mini", "GPT-4o Mini", "openai", "Affordable, rapid responses for student tutoring"),
                    new AiModelInfoDTO("gpt-4o", "GPT-4o Omnimodel", "openai", "State-of-the-art multimodal reasoning for STEM subjects"),
                    new AiModelInfoDTO("o3-mini", "o3 Mini Reasoning", "openai", "Deep logical proof checking and code analysis"),
                    new AiModelInfoDTO("gpt-4-turbo", "GPT-4 Turbo", "openai", "Comprehensive study guide synthesis")
            );
            case "openrouter" -> List.of(
                    new AiModelInfoDTO("deepseek/deepseek-r1", "DeepSeek R1 (OpenRouter)", "openrouter", "Open reasoning model with step-by-step thinking traces"),
                    new AiModelInfoDTO("anthropic/claude-3.5-sonnet", "Claude 3.5 Sonnet", "openrouter", "Top academic writing and complex document analysis"),
                    new AiModelInfoDTO("openai/gpt-4o-mini", "GPT-4o Mini", "openrouter", "Cost-effective, versatile assistant"),
                    new AiModelInfoDTO("meta-llama/llama-3.3-70b-instruct", "Llama 3.3 70B Instruct", "openrouter", "Open weights leader for general college tutoring")
            );
            case "deepseek" -> List.of(
                    new AiModelInfoDTO("deepseek-chat", "DeepSeek V3 (Chat)", "deepseek", "High intelligence, ultra-affordable pricing for students"),
                    new AiModelInfoDTO("deepseek-reasoner", "DeepSeek R1 (Reasoner)", "deepseek", "Deep chain-of-thought derivations")
            );
            case "gemini" -> List.of(
                    new AiModelInfoDTO("gemini-2.0-flash", "Gemini 2.0 Flash", "gemini", "High-speed reasoning with extensive context window"),
                    new AiModelInfoDTO("gemini-1.5-pro", "Gemini 1.5 Pro", "gemini", "Advanced document analysis with up to 1M token context"),
                    new AiModelInfoDTO("gemini-1.5-flash", "Gemini 1.5 Flash", "gemini", "Fast, free-tier accessible student helper")
            );
            case "anthropic" -> List.of(
                    new AiModelInfoDTO("claude-3-5-sonnet-20241022", "Claude 3.5 Sonnet", "anthropic", "Premier reasoning and graduate-level academic tutor"),
                    new AiModelInfoDTO("claude-3-5-haiku-20241022", "Claude 3.5 Haiku", "anthropic", "Ultra-fast response generator for quick study checks")
            );
            default -> List.of(
                    new AiModelInfoDTO("deepseek-r1:8b", "DeepSeek R1 8B (Local)", "ollama", "Local reasoning model running on student hardware"),
                    new AiModelInfoDTO("llama3.3:latest", "Llama 3.3 (Local)", "ollama", "General knowledge offline assistant"),
                    new AiModelInfoDTO("mistral:latest", "Mistral 7B (Local)", "ollama", "Compact offline tutor"),
                    new AiModelInfoDTO("phi4:latest", "Phi-4 (Local)", "ollama", "Microsoft 14B model for academic tasks"),
                    new AiModelInfoDTO("nomic-embed-text:latest", "Nomic Embed Text (Embeddings)", "ollama", "768-dim pgvector document indexer")
            );
        };
    }

    private String buildChatCompletionsUrl(String baseUrl) {
        String base = baseUrl != null ? baseUrl.trim() : DEFAULT_BASE_URLS.get("openai");
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        if (base.endsWith("/chat/completions")) {
            return base;
        }
        return base + "/chat/completions";
    }

    private String buildModelsUrl(String baseUrl) {
        String base = baseUrl != null ? baseUrl.trim() : DEFAULT_BASE_URLS.get("openai");
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        if (base.endsWith("/models")) {
            return base;
        }
        return base + "/models";
    }
}
