package com.TeachMe.TeachMe.service;

import org.springframework.ai.chat.client.ChatClient;

public interface OllamaModelRouter {
    ChatClient getChatClientForModel(String modelName);
    ChatClient getDefaultChatClient();
    ChatClient getFastExtractionChatClient();
    ChatClient getDeepReasoningChatClient();
}
