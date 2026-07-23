package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.OllamaModelRouter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OllamaModelRouterImpl implements OllamaModelRouter {

    private final ChatClient.Builder chatClientBuilder;
    private final Map<String, ChatClient> modelClientCache = new ConcurrentHashMap<>();
    private static final String DEFAULT_MODEL = "deepseek-r1:8b";
    private static final String FAST_MODEL = "qwen2.5:7b";
    private static final String REASONING_MODEL = "deepseek-r1:8b";

    public OllamaModelRouterImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClientBuilder = chatClientBuilder;
    }

    @Override
    public ChatClient getChatClientForModel(String modelName) {
        if (modelName == null || modelName.isBlank()) {
            return getDefaultChatClient();
        }
        return modelClientCache.computeIfAbsent(modelName, model -> {
            log.info("Configuring dynamic ChatClient for Ollama model: {}", model);
            return chatClientBuilder
                    .defaultOptions(ChatOptions.builder().model(model))
                    .build();
        });
    }

    @Override
    public ChatClient getDefaultChatClient() {
        return getChatClientForModel(DEFAULT_MODEL);
    }

    @Override
    public ChatClient getFastExtractionChatClient() {
        return getChatClientForModel(FAST_MODEL);
    }

    @Override
    public ChatClient getDeepReasoningChatClient() {
        return getChatClientForModel(REASONING_MODEL);
    }
}
