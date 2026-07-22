package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.DocumentSummaryDTO;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.DocumentSummarizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Document Summarization", description = "Endpoints for generating and fetching Map-Reduce executive summaries for documents.")
public class SummaryController {

    private static final String DOCUMENT_NOT_FOUND = "Document not found";

    private final DocumentSummarizationService summaryService;
    private final DocumentRepository documentRepository;
    private final AuthService authService;

    @PostMapping("/generate/{documentId}")
    @Operation(summary = "Generate document summary", description = "Triggers an asynchronous map-reduce summarization job for the specified document.")
    @ApiResponse(responseCode = "202", description = "Summary generation accepted and started in background")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    @ApiResponse(responseCode = "404", description = DOCUMENT_NOT_FOUND)
    public ResponseEntity<Map<String, String>> generateSummary(@PathVariable Long documentId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            Document doc = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException(DOCUMENT_NOT_FOUND));

            if (!doc.getUser().getId().equals(userId)) {
                log.warn("User {} attempted to generate summary for document {} they do not own", userId, documentId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            summaryService.generateSummaryAsync(documentId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "message", "Summary generation started in background",
                    "documentId", documentId.toString()
            ));

        } catch (Exception e) {
            log.error("Failed to start summary generation for document ID: {}", documentId, e);
            if (e.getMessage() != null && e.getMessage().contains(DOCUMENT_NOT_FOUND)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start summary generation: " + e.getMessage()));
        }
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Get document summary", description = "Retrieves the executive summary status and text for a specific document.")
    @ApiResponse(responseCode = "200", description = "Summary retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    @ApiResponse(responseCode = "404", description = "Summary not found")
    public ResponseEntity<DocumentSummaryDTO> getSummary(@PathVariable Long documentId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            Document doc = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException(DOCUMENT_NOT_FOUND));

            if (!doc.getUser().getId().equals(userId)) {
                log.warn("User {} attempted to fetch summary for document {} they do not own", userId, documentId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            DocumentSummaryDTO summary = summaryService.getSummary(documentId);
            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            log.error("Failed to fetch summary for document ID: {}", documentId, e);
            if (e.getMessage() != null && e.getMessage().contains(DOCUMENT_NOT_FOUND)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}