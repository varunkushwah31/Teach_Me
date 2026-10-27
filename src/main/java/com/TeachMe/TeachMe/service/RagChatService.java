package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ai.AiProviderConfigDTO;
import reactor.core.publisher.Flux;
import java.util.List;

public interface RagChatService {
    Flux<String> askQuestionStream(String question, String chatId, Long userId);
    Flux<String> askQuestionStream(String question, String chatId, Long userId, List<Long> documentIds);
    Flux<String> askQuestionStream(String question, String chatId, Long userId, List<Long> documentIds, AiProviderConfigDTO aiConfig);
}
