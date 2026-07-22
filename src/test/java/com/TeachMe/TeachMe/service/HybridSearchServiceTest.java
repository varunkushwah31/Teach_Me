package com.TeachMe.TeachMe.service;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HybridSearchServiceTest {

    @Mock
    private VectorStore vectorStore;

    @Mock
    private JdbcTemplate jdbcTemplate;

    private MeterRegistry meterRegistry;
    private HybridSearchService hybridSearchService;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        hybridSearchService = new HybridSearchService(vectorStore, jdbcTemplate, meterRegistry);
    }

    @Test
    void shouldCombineVectorAndFullTextSearchResultsWithRRF() {
        Document doc1 = new Document("doc-1", "Vector match text", Map.of("userId", 1L));

        when(vectorStore.similaritySearch(any(SearchRequest.class)))
                .thenReturn(List.of(doc1));

        doReturn(List.of(
                Map.of("id", "doc-2", "content", "FTS match text", "metadata", "{\"userId\":1}")
        )).when(jdbcTemplate).queryForList(anyString(), eq("query"), eq("1"), eq("chat-1"), eq(5));

        List<Document> results = hybridSearchService.hybridSearch("query", 1L, "chat-1", 5);

        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(d -> d.getId().equals("doc-1")));
        assertTrue(results.stream().anyMatch(d -> d.getId().equals("doc-2")));
    }

    @Test
    void shouldFallbackGracefullyWhenFullTextSearchFails() {
        Document doc1 = new Document("doc-1", "Vector match text", Map.of("userId", 1L));
        when(vectorStore.similaritySearch(any(SearchRequest.class))).thenReturn(List.of(doc1));

        // Simulate DB query failure for full-text search leg
        doThrow(new RuntimeException("SQL syntax error or tsvector missing"))
                .when(jdbcTemplate).queryForList(anyString(), eq("query"), eq("1"), eq("chat-1"), eq(5));

        List<Document> results = hybridSearchService.hybridSearch("query", 1L, "chat-1", 5);

        assertEquals(1, results.size());
        assertEquals("doc-1", results.get(0).getId());

        // Counter should have incremented
        assertEquals(1.0, meterRegistry.get("rag.fulltext.fallback.total").counter().count());
    }
}
