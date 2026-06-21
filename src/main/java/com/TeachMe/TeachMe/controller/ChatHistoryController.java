package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history/chats")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        return ResponseEntity.ok(chatHistoryService.getHistoryByUser(userId, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(chatHistoryService.searchHistoryByUser(userId, q, pageable));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(chatHistoryService.getHistoryByDocument(documentId, pageable));
    }

    @GetMapping("/document/{documentId}/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(chatHistoryService.searchHistoryByDocument(documentId, q, pageable));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(chatHistoryService.getHistoryBySession(sessionId, pageable));
    }

    @GetMapping("/session/{sessionId}/search")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(chatHistoryService.searchHistoryBySession(sessionId, q, pageable));
    }
}