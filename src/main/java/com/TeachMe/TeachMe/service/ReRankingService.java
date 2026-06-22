package com.TeachMe.TeachMe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReRankingService {

    private final ChatClient chatClient;

    public ReRankingService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public List<Document> reRankChunks(String query, List<Document> chunks, int topK) {
        log.info("Re-ranking {} chunks for query: {}", chunks.size(), query);

        if (chunks.size() <= topK) {
            return chunks;
        }

        Map<String, Double> relevanceScores = new HashMap<>();

        for (Document chunk : chunks) {
            double score = calculateRelevanceScore(query, chunk.getText());
            relevanceScores.put(chunk.getId(), score);
        }

        // Modern Java Streams
        return chunks.stream()
                .sorted((a, b) -> Double.compare(
                        relevanceScores.getOrDefault(b.getId(), 0.0),
                        relevanceScores.getOrDefault(a.getId(), 0.0)
                ))
                .limit(topK)
                .toList();
    }

    private double calculateRelevanceScore(String query, String chunkText) {
        try {
            String[] queryTerms = query.toLowerCase().split("[\\s\\p{Punct}]+");
            String chunkLower = chunkText.toLowerCase();

            double keywordScore = 0;
            for (String term : queryTerms) {
                if (term.length() > 2 && chunkLower.contains(term)) {
                    keywordScore += 1.0;
                }
            }

            double semanticScore = getSemanticRelevanceScore(query, chunkText);

            // Immediately return score without assigning variable
            return (keywordScore * 0.3) + (semanticScore * 0.7);

        } catch (Exception e) {
            log.warn("Error calculating relevance score", e);
            return 0.0;
        }
    }

    private double getSemanticRelevanceScore(String query, String chunk) {
        try {
            String truncatedChunk = chunk.length() > 500 ? chunk.substring(0, 500) + "..." : chunk;

            String prompt = String.format(
                    "Rate how relevant this text chunk is to the query '%s' on a scale of 0-10 (only respond with a number):\\n%s",
                    query, truncatedChunk
            );

            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            if (response == null) return 0.5;

            return Double.parseDouble(response.trim().replaceAll("\\D", "")) / 10.0;

        } catch (Exception e) {
            log.warn("Error getting semantic relevance score", e);
            return 0.5;
        }
    }

    /**
     * Trigger the batchReRank method
     */
    public Map<String, List<Document>> processMultipleQueries(Map<String, List<Document>> queries) {
        return batchReRank(queries, 4);
    }

    /**
     * Batch re-rank multiple query-chunk pairs
     */
    public Map<String, List<Document>> batchReRank(Map<String, List<Document>> queryChunksMap, int topK) {
        return queryChunksMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> reRankChunks(entry.getKey(), entry.getValue(), topK)
                ));
    }
}