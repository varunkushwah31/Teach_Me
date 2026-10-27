package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ai.AiConnectionTestResultDTO;
import com.TeachMe.TeachMe.dto.ai.AiModelInfoDTO;
import com.TeachMe.TeachMe.dto.ai.AiProviderConfigDTO;
import reactor.core.publisher.Flux;

import java.util.List;

public interface ExternalAiService {

    Flux<String> streamChat(String systemPrompt, String userPrompt, AiProviderConfigDTO config);

    String generateText(String systemPrompt, String userPrompt, AiProviderConfigDTO config);

    AiConnectionTestResultDTO testConnection(AiProviderConfigDTO config);

    List<AiModelInfoDTO> getAvailableModels(String provider, String baseUrl, String apiKey);

    AiProviderConfigDTO resolveConfig(AiProviderConfigDTO requestConfig);

    boolean isExternalConfigured();
}
