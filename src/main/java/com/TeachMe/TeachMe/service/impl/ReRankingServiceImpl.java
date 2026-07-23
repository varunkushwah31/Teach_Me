package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.ReRankingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import io.micrometer.core.annotation.Timed;

import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReRankingServiceImpl implements ReRankingService {

    private final ChatClient chatClient;

    public ReRankingServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public List<Document> reRankChunks(String query, List<Document> chunks, int topK) {
        if (chunks == null || chunks.isEmpty()) {
            return List.of();
        }
        if (chunks.size() <= topK) {
            return chunks;
        }

        log.info("Single-batch LLM re-ranking starting for {} candidate chunks for query: '{}'", chunks.size(), query);

        List<Document> llmResult = tryLlmReRank(query, chunks, topK);
        if (llmResult != null && !llmResult.isEmpty()) {
            return llmResult;
        }

        return fallbackKeywordRank(query, chunks, topK);
    }

    private List<Document> tryLlmReRank(String query, List<Document> chunks, int topK) {
        try {
            String prompt = buildReRankPrompt(query, chunks);
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            if (response != null && response.contains("\u200B")) {
                response = response.substring(response.indexOf("\u200B") + 1);
            }

            if (response != null && !response.isBlank()) {
                return parseReRankResponse(response, chunks, topK);
            }
        } catch (Exception e) {
            log.warn("Single-batch LLM re-ranking failed - falling back to keyword overlap ranking. Error: {}", e.getMessage());
        }
        return List.of();
    }

    private String buildReRankPrompt(String query, List<Document> chunks) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("User Query: \"").append(query).append("\"\n\n");
        promptBuilder.append("Candidate Chunks:\n");
        for (int i = 0; i < chunks.size(); i++) {
            String textSnippet = chunks.get(i).getText();
            if (textSnippet != null && textSnippet.length() > 300) {
                textSnippet = textSnippet.substring(0, 300) + "...";
            }
            promptBuilder.append("[").append(i + 1).append("] ").append(textSnippet).append("\n");
        }
        promptBuilder.append("\nInstructions: Rank the candidate chunk IDs from most relevant to least relevant for the user query. ");
        promptBuilder.append("Output ONLY a comma-separated list of indices (e.g. 2,1,4,3). Do not output any reasoning or extra text.");
        return promptBuilder.toString();
    }

    private List<Document> parseReRankResponse(String response, List<Document> chunks, int topK) {
        String cleaned = response.replaceAll("[^0-9,]", "");
        String[] indexStrs = cleaned.split(",");
        List<Document> reRanked = new ArrayList<>();
        Set<Integer> addedIndices = new HashSet<>();

        for (String s : indexStrs) {
            if (s.isBlank()) {
                continue;
            }
            try {
                int idx = Integer.parseInt(s.trim()) - 1;
                if (idx >= 0 && idx < chunks.size() && !addedIndices.contains(idx)) {
                    reRanked.add(chunks.get(idx));
                    addedIndices.add(idx);
                }
            } catch (NumberFormatException _) {
            }
        }

        for (int i = 0; i < chunks.size(); i++) {
            if (!addedIndices.contains(i)) {
                reRanked.add(chunks.get(i));
            }
        }

        return reRanked.stream().limit(topK).toList();
    }

    private List<Document> fallbackKeywordRank(String query, List<Document> chunks, int topK) {
        String[] queryTerms = query.toLowerCase().split("[\\s\\p{Punct}]+");
        return chunks.stream()
                .sorted((a, b) -> Double.compare(
                        keywordScore(queryTerms, b.getText()),
                        keywordScore(queryTerms, a.getText())))
                .limit(topK)
                .toList();
    }

    private double keywordScore(String[] queryTerms, String chunkText) {
        if (chunkText == null) {
            return 0.0;
        }
        String lower = chunkText.toLowerCase();
        return Arrays.stream(queryTerms)
                .filter(t -> t.length() > 2 && lower.contains(t))
                .count();
    }

    @Override
    public Map<String, List<Document>> processMultipleQueries(Map<String, List<Document>> queries) {
        return batchReRank(queries, 4);
    }

    @Override
    @Timed("rag.search.rerank")
    public Map<String, List<Document>> batchReRank(
            Map<String, List<Document>> queryChunksMap, int topK) {
        return queryChunksMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Entry::getKey,
                        e -> reRankChunks(e.getKey(), e.getValue(), topK)));
    }
}
