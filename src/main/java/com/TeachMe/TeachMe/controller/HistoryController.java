package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;
    private final UserRepository userRepository;

    // Helper method to securely get the logged-in user's ID
    private Long getAuthenticatedUserId() {
        String email = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // ==========================================
    // CHAT ENDPOINTS
    // ==========================================

    @GetMapping("/chat")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(historyService.getChatHistoryByUser(userId, pageable));
    }

    @GetMapping("/chat/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.searchChatHistoryByUser(userId, q, pageable));
    }

    @GetMapping("/chat/document/{documentId}")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.getChatHistoryByDocument(documentId, pageable));
    }

    @GetMapping("/chat/document/{documentId}/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.searchChatHistoryByDocument(documentId, q, pageable));
    }

    @GetMapping("/chat/session/{sessionId}")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.getChatHistoryBySession(sessionId, pageable));
    }

    @GetMapping("/chat/session/{sessionId}/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.searchChatHistoryBySession(sessionId, q, pageable));
    }

    // ==========================================
    // DOCUMENT ENDPOINTS
    // ==========================================

    @GetMapping("/documents")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(historyService.getDocumentHistoryByUser(userId, pageable));
    }

    @GetMapping("/documents/search")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.searchDocumentHistoryByUser(userId, q, pageable));
    }

    @GetMapping("/documents/status/{status}")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(historyService.getDocumentHistoryByUserAndStatus(userId, docStatus, pageable));
    }

    @GetMapping("/documents/status/{status}/search")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(historyService.searchDocumentHistoryByUserAndStatus(userId, docStatus, q, pageable));
    }
}