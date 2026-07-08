package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.controller.SearchController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReRankingService {

    /**
     * Re-ranks {@code chunks} by keyword overlap with the query and returns the
     * top-{@code topK} results.
     *
     * <p>The previous implementation called the LLM once per chunk (O(n) Ollama
     * round-trips per user message). With 8 chunks and a local deepseek-r1:8b
     * model that adds ~8 × 3-5 s ≈ 30–40 s of latency before the user sees a
     * single token — unacceptable for a streaming chat interface.
     *
     * <p>Keyword scoring alone is enough here: the upstream HybridSearchService
     * already narrows the candidate set to semantically relevant chunks via pgvector
     * cosine similarity and full-text BM25. Re ranking only needs to break ties and
     * push the most query-term-dense chunks to the top.
     *
     * <p>If you later want semantic re-ranking, the right approach is a single
     * batched prompt: "Given query Q, rank these 8 chunk IDs by relevance. Return
     * only: 3,1,7,2,…" — one LLM call instead of eight.
     */
    public List<Document> reRankChunks(String query, List<Document> chunks, int topK) {
        log.info("Re-ranking {} chunks for query: '{}'", chunks.size(), query);

        if (chunks.size() <= topK) {
            return chunks;
        }

        String[] queryTerms = query.toLowerCase().split("[\\s\\p{Punct}]+");

        return chunks.stream()
                .sorted((a, b) -> Double.compare(
                        keywordScore(queryTerms, b.getText()),
                        keywordScore(queryTerms, a.getText())))
                .limit(topK)
                .toList();
    }

    /**
     * Returns the number of distinct query terms (longer than 2 chars) that
     * appear in {@code chunkText}. Simple, fast, zero external calls.
     */
    private double keywordScore(String[] queryTerms, String chunkText) {
        if (chunkText == null) return 0.0;
        String lower = chunkText.toLowerCase();
        return Arrays.stream(queryTerms)
                .filter(t -> t.length() > 2 && lower.contains(t))
                .count();
    }

    /** Convenience wrapper used by {@link SearchController}. */
    public Map<String, List<Document>> processMultipleQueries(
            Map<String, List<Document>> queries) {
        return batchReRank(queries, 4);
    }

    public Map<String, List<Document>> batchReRank(
            Map<String, List<Document>> queryChunksMap, int topK) {
        return queryChunksMap.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey(),
                        e -> reRankChunks(e.getKey(), e.getValue(), topK)));
    }
}