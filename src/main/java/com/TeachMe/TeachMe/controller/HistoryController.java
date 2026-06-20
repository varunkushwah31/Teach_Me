package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;
    private final UserRepository userRepository;

    // Chat History Endpoints
    @GetMapping("/chat")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        PaginatedResponse<ChatHistoryDTO> response = historyService.getChatHistoryByUser(user.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        PaginatedResponse<ChatHistoryDTO> response = historyService.searchChatHistoryByUser(user.getId(), q, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/document/{documentId}")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<ChatHistoryDTO> response = historyService.getChatHistoryByDocument(documentId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/document/{documentId}/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<ChatHistoryDTO> response = historyService.searchChatHistoryByDocument(documentId, q, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/session/{sessionId}")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<ChatHistoryDTO> response = historyService.getChatHistoryBySession(sessionId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/session/{sessionId}/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PaginatedResponse<ChatHistoryDTO> response = historyService.searchChatHistoryBySession(sessionId, q, page, size);
        return ResponseEntity.ok(response);
    }

    // Document History Endpoints
    @GetMapping("/documents")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        PaginatedResponse<DocumentHistoryDTO> response = historyService.getDocumentHistoryByUser(user.getId(), page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents/search")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        PaginatedResponse<DocumentHistoryDTO> response = historyService.searchDocumentHistoryByUser(user.getId(), q, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents/status/{status}")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> getDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        PaginatedResponse<DocumentHistoryDTO> response = historyService.getDocumentHistoryByUserAndStatus(user.getId(), docStatus, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents/status/{status}/search")
    public ResponseEntity<PaginatedResponse<DocumentHistoryDTO>> searchDocumentHistoryByStatus(
            @PathVariable String status,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        PaginatedResponse<DocumentHistoryDTO> response = historyService.searchDocumentHistoryByUserAndStatus(user.getId(), docStatus, q, page, size);
        return ResponseEntity.ok(response);
    }
}
