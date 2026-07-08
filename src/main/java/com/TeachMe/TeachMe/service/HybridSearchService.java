package com.TeachMe.TeachMe.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@Transactional(readOnly = true)
public class HybridSearchService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Counts how often the full-text leg of the hybrid search silently fell back
     * to vector-only (e.g., pg_trgm not installed, schema mismatch, SQL error).
     * Exposed on the /actuator/prometheus endpoint so the operations dashboard
     * can alert on sustained degradation instead of relying on log scraping.
     */
    private final Counter fullTextFallbackCounter;

    public HybridSearchService(VectorStore vectorStore,
            JdbcTemplate jdbcTemplate,
            MeterRegistry meterRegistry) {
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
        this.fullTextFallbackCounter = Counter.builder("rag.fulltext.fallback.total")
                .description("Number of times full-text search fell back to vector-only search")
                .register(meterRegistry);
    }

    public List<Document> hybridSearch(String query, Long userId, String chatId, int topK) {
        log.info("Hybrid search: query='{}' topK={}", query, topK);

        List<Document> vectorResults = vectorSearchResults(query, userId, chatId, topK);
        log.info("Vector search returned {} results", vectorResults.size());

        List<Document> fullTextResults = fullTextSearchResults(query, userId, chatId, topK);
        log.info("Full-text search returned {} results", fullTextResults.size());

        List<Document> fused = reciprocalRankFusion(vectorResults, fullTextResults, topK);
        log.info("RRF fusion produced {} results", fused.size());

        return fused;
    }

    private List<Document> vectorSearchResults(String query, Long userId, String chatId, int topK) {
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .filterExpression(b.and(b.eq("userId", userId), b.eq("chatId", chatId)).build())
                .build();
        return vectorStore.similaritySearch(request);
    }

    private List<Document> fullTextSearchResults(
            String query, Long userId, String chatId, int topK) {
        try {
            String sql = """
                    SELECT id, content, metadata, ts_rank_cd(to_tsvector('english', content), q) AS rank
                    FROM vector_store,
                         plainto_tsquery('english', ?) q
                    WHERE to_tsvector('english', content) @@ q
                      AND metadata->>'userId' = ?
                      AND metadata->>'chatId' = ?
                    ORDER BY rank DESC
                    LIMIT ?
                    """;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, query, String.valueOf(userId), chatId,
                    topK);
            List<Document> docs = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                String id = String.valueOf(row.get("id"));
                String content = String.valueOf(row.get("content"));
                Map<String, Object> metadata = parseMetadata(row.get("metadata"));
                docs.add(new Document(id, content, metadata));
            }
            return docs;
        } catch (Exception e) {
            // Increment the Micrometer counter so dashboards can detect silent
            // degradation (e.g., pg_trgm not installed) without manual log scraping.
            fullTextFallbackCounter.increment();
            log.warn("Full-text search failed — falling back to vector-only. Error: {}",
                    e.getMessage());
            return new ArrayList<>();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseMetadata(Object metadataObj) {
        if (metadataObj == null) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(metadataObj.toString(), Map.class);
        } catch (Exception e) {
            log.warn("Failed to parse document metadata JSON: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private List<Document> reciprocalRankFusion(List<Document> vectorResults,
            List<Document> fullTextResults,
            int topK) {
        Map<String, Double> rrfScores = new HashMap<>();
        Map<String, Document> documentMap = new HashMap<>();
        final int k = 60;

        for (int rank = 0; rank < vectorResults.size(); rank++) {
            Document doc = vectorResults.get(rank);
            String docId = doc.getId();
            rrfScores.merge(docId, 1.0 / (k + rank + 1), Double::sum);
            documentMap.put(docId, doc);
        }

        for (int rank = 0; rank < fullTextResults.size(); rank++) {
            Document doc = fullTextResults.get(rank);
            String docId = doc.getId();
            rrfScores.merge(docId, 1.0 / (k + rank + 1), Double::sum);
            if (!documentMap.containsKey(docId)) {
                documentMap.put(docId, doc);
            }
        }

        return rrfScores.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(topK)
                .map(e -> documentMap.get(e.getKey()))
                .filter(Objects::nonNull)
                .toList();
    }
}