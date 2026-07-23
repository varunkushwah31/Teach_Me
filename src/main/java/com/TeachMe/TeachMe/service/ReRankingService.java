package com.TeachMe.TeachMe.service;

import org.springframework.ai.document.Document;
import java.util.List;
import java.util.Map;

public interface ReRankingService {
    List<Document> reRankChunks(String query, List<Document> chunks, int topK);
    Map<String, List<Document>> processMultipleQueries(Map<String, List<Document>> queries);
    Map<String, List<Document>> batchReRank(Map<String, List<Document>> queryChunksMap, int topK);
}