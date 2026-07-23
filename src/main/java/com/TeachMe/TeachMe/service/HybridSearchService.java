package com.TeachMe.TeachMe.service;

import org.springframework.ai.document.Document;
import java.util.List;

public interface HybridSearchService {
    void ensureHnswIndex();
    List<Document> hybridSearch(String query, Long userId, String chatId, int topK);
    List<Document> hybridSearch(String query, Long userId, String chatId, List<Long> documentIds, int topK);
}