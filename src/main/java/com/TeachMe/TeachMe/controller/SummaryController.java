package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.DocumentSummaryDTO;
import com.TeachMe.TeachMe.service.DocumentSummarizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final DocumentSummarizationService summaryService;

    @PostMapping("/generate/{documentId}")
    public ResponseEntity<Map<String, String>> generateSummary(@PathVariable Long documentId) {
        try {
            summaryService.generateSummaryAsync(documentId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "message", "Summary generation started in background",
                    "documentId", documentId.toString()
            ));

        } catch (Exception e) {
            log.error("Failed to start summary generation for document ID: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start summary generation: " + e.getMessage()));
        }
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentSummaryDTO> getSummary(@PathVariable Long documentId) {
        try {
            DocumentSummaryDTO summary = summaryService.getSummary(documentId);
            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            log.error("Failed to fetch summary for document ID: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}