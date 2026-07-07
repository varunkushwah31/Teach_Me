package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.DocumentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history/documents")
@RequiredArgsConstructor
@Tag(name = "Document History", description = "Endpoints for retrieving and searching history of uploaded learning documents.")
public class DocumentHistoryController {

    private final DocumentHistoryService documentHistoryService;
    private final AuthService authService;
    private static final String DEFAULT_SORT_COLUMN = "createdAt";

    @GetMapping
    @Operation(summary = "Get document history", description = "Retrieves a paginated list of all document ingestion histories belonging to the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Document history retrieved successfully")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(documentHistoryService.getHistoryByUser(userId, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search document history", description = "Searches the user's document history for the given query term, returning paginated results.")
    @ApiResponse(responseCode = "200", description = "Document search results retrieved successfully")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(documentHistoryService.searchHistoryByUser(userId, q, pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get document history by status", description = "Retrieves a paginated list of user documents filtered by processing status (PENDING, PROCESSING, COMPLETED, FAILED).")
    @ApiResponse(responseCode = "200", description = "Documents retrieved successfully")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = authService.getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(documentHistoryService.getHistoryByUserAndStatus(userId, docStatus, pageable));
    }

    @GetMapping("/status/{status}/search")
    @Operation(summary = "Search document history by status", description = "Searches user documents of a specific processing status, returning paginated results.")
    @ApiResponse(responseCode = "200", description = "Documents search results retrieved successfully")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(documentHistoryService.searchHistoryByUserAndStatus(userId, docStatus, q, pageable));
    }
}