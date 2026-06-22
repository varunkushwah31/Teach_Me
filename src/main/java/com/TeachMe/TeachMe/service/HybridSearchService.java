package com.TeachMe.TeachMe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class HybridSearchService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public HybridSearchService(VectorStore vectorStore, JdbcTemplate jdbcTemplate) {
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Document> hybridSearch(String query, Long userId, String chatId, int topK) {
        log.info("Starting hybrid search for query: {} with topK: {}", query, topK);

        List<Document> vectorResults = vectorSearchResults(query, userId, chatId, topK);
        log.info("Vector search returned {} results", vectorResults.size());

        List<Map<String, Object>> fullTextResults = fullTextSearchResults(query, userId, chatId, topK);
        log.info("Full-text search returned {} results", fullTextResults.size());

        List<Document> fusedResults = reciprocalRankFusion(vectorResults, fullTextResults, topK);
        log.info("RRF fusion returned {} combined results", fusedResults.size());

        return fusedResults;
    }

    private List<Document> vectorSearchResults(String query, Long userId, String chatId, int topK) {
        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .query(query)
                .topK(topK);

        FilterExpressionBuilder b = new FilterExpressionBuilder();
        var dynamicFilter = b.and(
                b.eq("userId", userId),
                b.eq("chatId", chatId)
        );
        requestBuilder.filterExpression(dynamicFilter.build());

        return vectorStore.similaritySearch(requestBuilder.build());
    }

    private List<Map<String, Object>> fullTextSearchResults(String query, Long userId, String chatId, int topK) {
        try {
            // Note: Requires the 'pg_trgm' extension and a tsvector column
            String sql = """
                    SELECT id, content, ts_rank_cd(to_tsvector('english', content), query) AS rank
                    FROM vector_store,
                         plainto_tsquery('english', ?) query
                    WHERE to_tsvector('english', content) @@ query
                    AND metadata->>'userId' = ?
                    AND metadata->>'chatId' = ?
                    ORDER BY rank DESC
                    LIMIT ?
                    """;

            return jdbcTemplate.queryForList(sql, query, String.valueOf(userId), chatId, topK);

        } catch (Exception e) {
            log.warn("Full-text search failed. Falling back to vector-only. Error: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<Document> reciprocalRankFusion(List<Document> vectorResults,
                                                List<Map<String, Object>> fullTextResults,
                                                int topK) {
        Map<String, Double> rrfScores = new HashMap<>();
        Map<String, Document> documentMap = new HashMap<>();
        final int k = 60;

        for (int rank = 0; rank < vectorResults.size(); rank++) {
            Document doc = vectorResults.get(rank);
            String docId = doc.getId();
            double rrfScore = 1.0 / (k + rank + 1);
            rrfScores.put(docId, rrfScores.getOrDefault(docId, 0.0) + rrfScore);
            documentMap.put(docId, doc);
        }

        for (int rank = 0; rank < fullTextResults.size(); rank++) {
            Map<String, Object> result = fullTextResults.get(rank);
            String docId = String.valueOf(result.get("id"));
            double rrfScore = 1.0 / (k + rank + 1);
            rrfScores.put(docId, rrfScores.getOrDefault(docId, 0.0) + rrfScore);
        }

        // ✅ Modern Java Streams
        return rrfScores.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(topK)
                .map(entry -> documentMap.get(entry.getKey()))
                .filter(Objects::nonNull)
                .toList();
    }
}