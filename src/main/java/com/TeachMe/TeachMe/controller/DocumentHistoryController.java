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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DocumentHistoryController {

    private final DocumentHistoryService documentHistoryService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(documentHistoryService.getHistoryByUser(userId, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(documentHistoryService.searchHistoryByUser(userId, q, pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = authService.getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(documentHistoryService.getHistoryByUserAndStatus(userId, docStatus, pageable));
    }

    @GetMapping("/status/{status}/search")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(documentHistoryService.searchHistoryByUserAndStatus(userId, docStatus, q, pageable));
    }
}