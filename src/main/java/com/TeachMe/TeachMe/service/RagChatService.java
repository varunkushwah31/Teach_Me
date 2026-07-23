package com.TeachMe.TeachMe.service;

import reactor.core.publisher.Flux;
import java.util.List;

public interface RagChatService {
    Flux<String> askQuestionStream(String question, String chatId, Long userId);
    Flux<String> askQuestionStream(String question, String chatId, Long userId, List<Long> documentIds);
}