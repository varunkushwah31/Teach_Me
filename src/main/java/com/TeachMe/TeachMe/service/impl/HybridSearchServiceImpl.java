package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.HybridSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import io.micrometer.core.annotation.Timed;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.util.*;

@Slf4j
@Service
@Transactional(readOnly = true)
public class HybridSearchServiceImpl implements HybridSearchService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Counter fullTextFallbackCounter;

    public HybridSearchServiceImpl(VectorStore vectorStore,
                                  JdbcTemplate jdbcTemplate,
                                  MeterRegistry meterRegistry) {
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
        this.fullTextFallbackCounter = Counter.builder("rag.fulltext.fallback.total")
                .description("Number of times full-text search fell back to vector-only search")
                .register(meterRegistry);
    }

    @Override
    @EventListener(ApplicationReadyEvent.class)
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void ensureHnswIndex() {
        try {
            log.info("Ensuring HNSW index idx_vector_store_hnsw exists on vector_store...");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_vector_store_hnsw ON vector_store USING hnsw (embedding vector_cosine_ops)");
            log.info("HNSW index checked/created successfully.");
        } catch (Exception e) {
            log.warn("Could not ensure HNSW index creation: {}", e.getMessage());
        }
    }

    @Override
    @Timed("rag.search.hybrid")
    public List<Document> hybridSearch(String query, Long userId, String chatId, int topK) {
        return hybridSearch(query, userId, chatId, List.of(), topK);
    }

    @Override
    @Timed("rag.search.hybrid.filtered")
    public List<Document> hybridSearch(String query, Long userId, String chatId, List<Long> documentIds, int topK) {
        log.info("Hybrid search: query='{}' topK={} documentFilterCount={}", query, topK, documentIds != null ? documentIds.size() : 0);

        List<Document> vectorResults = vectorSearchResults(query, userId, chatId, documentIds, topK);
        log.info("Vector search returned {} results", vectorResults.size());

        List<Document> fullTextResults = fullTextSearchResults(query, userId, chatId, documentIds, topK);
        log.info("Full-text search returned {} results", fullTextResults.size());

        List<Document> fused = reciprocalRankFusion(vectorResults, fullTextResults, topK);
        log.info("RRF fusion produced {} results", fused.size());

        return fused;
    }

    private List<Document> vectorSearchResults(String query, Long userId, String chatId, List<Long> documentIds, int topK) {
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        var baseGroup = b.and(b.eq("userId", userId), b.eq("chatId", chatId));
        
        org.springframework.ai.vectorstore.filter.Filter.Expression filterExp;
        if (documentIds != null && !documentIds.isEmpty()) {
            if (documentIds.size() == 1) {
                filterExp = b.and(baseGroup, b.eq("dbDocumentId", documentIds.getFirst())).build();
            } else {
                filterExp = b.and(baseGroup, b.in("dbDocumentId", documentIds.toArray())).build();
            }
        } else {
            filterExp = baseGroup.build();
        }

        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .filterExpression(filterExp)
                .build();
        return vectorStore.similaritySearch(request);
    }

    private List<Document> fullTextSearchResults(
            String query, Long userId, String chatId, List<Long> documentIds, int topK) {
        try {
            StringBuilder sqlBuilder = new StringBuilder("""
                    SELECT id, content, metadata, ts_rank_cd(to_tsvector('english', content), q) AS rank
                    FROM vector_store,
                         plainto_tsquery('english', ?) q
                    WHERE to_tsvector('english', content) @@ q
                      AND metadata->>'userId' = ?
                      AND metadata->>'chatId' = ?
                    """);

            List<Object> params = new ArrayList<>();
            params.add(query);
            params.add(String.valueOf(userId));
            params.add(chatId);

            if (documentIds != null && !documentIds.isEmpty()) {
                sqlBuilder.append(" AND (metadata->>'dbDocumentId')::bigint IN (");
                for (int i = 0; i < documentIds.size(); i++) {
                    sqlBuilder.append(i > 0 ? ",?" : "?");
                    params.add(documentIds.get(i));
                }
                sqlBuilder.append(")");
            }

            sqlBuilder.append(" ORDER BY rank DESC LIMIT ?");
            params.add(topK);

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sqlBuilder.toString(), params.toArray());
            List<Document> docs = new ArrayList<>();
            for (Map<String, Object> row : rows) {
                String id = String.valueOf(row.get("id"));
                String content = String.valueOf(row.get("content"));
                Map<String, Object> metadata = parseMetadata(row.get("metadata"));
                docs.add(new Document(id, content, metadata));
            }
            return docs;
        } catch (Exception e) {
            fullTextFallbackCounter.increment();
            log.warn("Full-text search failed — falling back to vector-only. Error: {}", e.getMessage());
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
            documentMap.putIfAbsent(docId, doc);
        }

        return rrfScores.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(topK)
                .map(e -> documentMap.get(e.getKey()))
                .filter(Objects::nonNull)
                .toList();
    }
}
