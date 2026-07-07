package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.HybridSearchService;
import com.TeachMe.TeachMe.service.ReRankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final HybridSearchService hybridSearchService;
    private final ReRankingService reRankingService;
    private final AuthService authService;

    /**
     * Advanced AI Feature: Batch Search & Re-Rank
     * Accepts multiple queries simultaneously, searches the vector DB for each,
     * and uses the ReRankingService's batch processing to score them all.
     */
    @PostMapping("/batch/{chatId}")
    public ResponseEntity<Map<String, List<String>>> batchSearchAndReRank(
            @PathVariable String chatId,
            @RequestBody List<String> queries) {

        try {
            Long userId = authService.getAuthenticatedUserId();

            // 1. Perform Hybrid Search for every query in the batch
            Map<String, List<Document>> searchResults = queries.stream()
                    .distinct()
                    .collect(Collectors.toMap(
                            query -> query,
                            query -> hybridSearchService.hybridSearch(query, userId, chatId, 8)
                    ));

            // 2. ✅ Actively consumes the processMultipleQueries / batchReRank method
            Map<String, List<Document>> reRankedResults = reRankingService.processMultipleQueries(searchResults);

            // 3. Map the complex Document objects to simple text chunks for the frontend
            Map<String, List<String>> finalResults = reRankedResults.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> entry.getValue().stream().map(Document::getText).toList()
                    ));

            return ResponseEntity.ok(finalResults);

        } catch (Exception e) {
            log.error("Failed to perform batch search for chat ID: {}", chatId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}