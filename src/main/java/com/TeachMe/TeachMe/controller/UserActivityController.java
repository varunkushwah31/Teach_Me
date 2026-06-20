package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatResponse;
import com.TeachMe.TeachMe.dto.DocumentResponse;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.UserActivityService;
import lombok.RequiredArgsConstructor;
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

    // --- Document Endpoints ---

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

    // --- Chat Endpoints ---

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
}