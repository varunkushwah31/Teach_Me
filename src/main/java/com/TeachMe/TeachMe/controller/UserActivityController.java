package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatResponse;
import com.TeachMe.TeachMe.dto.DocumentResponse;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserActivityController {

    private final UserActivityService activityService;
    private final UserRepository userRepository;

    // Helper method to securely get the logged-in user's ID
    private Long getAuthenticatedUserId() {
        String email = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // --- Document Endpoints (Legacy - returns List) ---

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(
            @RequestParam(required = false, defaultValue = "true") boolean sorted) {
        Long userId = getAuthenticatedUserId();
        if (sorted) {
            return ResponseEntity.ok(activityService.getRecentUserDocuments(userId));
        }
        return ResponseEntity.ok(activityService.getAllUserDocumentsUnsorted(userId));
    }

    @GetMapping("/documents/status/{status}")
    public ResponseEntity<List<DocumentResponse>> getMyDocumentsByStatus(@PathVariable String status) {
        Long userId = getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(activityService.getUserDocumentsByStatus(userId, docStatus));
    }

    // --- Document Endpoints (Paginated) ---

    @GetMapping("/documents/paginated")
    public ResponseEntity<PaginatedResponse<DocumentResponse>> getMyDocumentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(activityService.getRecentUserDocumentsPaged(userId, pageable));
    }

    @GetMapping("/documents/status/{status}/paginated")
    public ResponseEntity<PaginatedResponse<DocumentResponse>> getMyDocumentsByStatusPaginated(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(activityService.getUserDocumentsByStatusPaged(userId, docStatus, pageable));
    }

    @GetMapping("/documents/search")
    public ResponseEntity<PaginatedResponse<DocumentResponse>> searchDocuments(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.searchUserDocuments(userId, q, pageable));
    }

    @GetMapping("/documents/status/{status}/search")
    public ResponseEntity<PaginatedResponse<DocumentResponse>> searchDocumentsByStatus(
            @PathVariable String status,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.searchUserDocumentsByStatus(userId, docStatus, q, pageable));
    }

    // --- Chat Endpoints (Legacy - returns List) ---

    @GetMapping("/chats")
    public ResponseEntity<List<ChatResponse>> getMyChats(
            @RequestParam(required = false, defaultValue = "true") boolean sorted) {
        Long userId = getAuthenticatedUserId();
        if (sorted) {
            return ResponseEntity.ok(activityService.getRecentUserChats(userId));
        }
        return ResponseEntity.ok(activityService.getAllUserChatsUnsorted(userId));
    }

    @GetMapping("/chats/session/{sessionId}")
    public ResponseEntity<List<ChatResponse>> getChatsBySession(@PathVariable String sessionId) {
        // Security Note: In a production app, verify this session actually belongs to the logged-in user!
        return ResponseEntity.ok(activityService.getChatsBySession(sessionId));
    }

    @GetMapping("/chats/document/{documentId}")
    public ResponseEntity<List<ChatResponse>> getChatsByDocument(
            @PathVariable Long documentId,
            @RequestParam(required = false, defaultValue = "true") boolean sorted) {
        if (sorted) {
            return ResponseEntity.ok(activityService.getRecentDocumentChats(documentId));
        }
        return ResponseEntity.ok(activityService.getAllDocumentChatsUnsorted(documentId));
    }

    // --- Chat Endpoints (Paginated) ---

    @GetMapping("/chats/paginated")
    public ResponseEntity<PaginatedResponse<ChatResponse>> getMyChatsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.getRecentUserChatsPaged(userId, pageable));
    }

    @GetMapping("/chats/search")
    public ResponseEntity<PaginatedResponse<ChatResponse>> searchChats(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.searchUserChats(userId, q, pageable));
    }

    @GetMapping("/chats/document/{documentId}/paginated")
    public ResponseEntity<PaginatedResponse<ChatResponse>> getChatsByDocumentPaginated(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.getRecentDocumentChatsPaged(documentId, pageable));
    }

    @GetMapping("/chats/document/{documentId}/search")
    public ResponseEntity<PaginatedResponse<ChatResponse>> searchChatsByDocument(
            @PathVariable Long documentId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.searchDocumentChats(documentId, q, pageable));
    }

    @GetMapping("/chats/session/{sessionId}/paginated")
    public ResponseEntity<PaginatedResponse<ChatResponse>> getChatsBySessionPaginated(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.getChatsBySessionPaged(sessionId, pageable));
    }

    @GetMapping("/chats/session/{sessionId}/search")
    public ResponseEntity<PaginatedResponse<ChatResponse>> searchChatsBySession(
            @PathVariable String sessionId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(activityService.searchChatsBySession(sessionId, q, pageable));
    }
}