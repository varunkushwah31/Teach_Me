package com.TeachMe.TeachMe.service;

import java.util.List;
import java.util.Map;

public interface OllamaConnectionService {
    Map<String, Object> testConnection(String baseUrl);
    List<Map<String, Object>> fetchAvailableModels(String baseUrl);
}
