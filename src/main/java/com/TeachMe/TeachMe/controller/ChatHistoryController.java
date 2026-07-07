package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history/chats")
@RequiredArgsConstructor
@Tag(name = "Chat History", description = "Endpoints for retrieving and searching chat history, scoped by user, document, or session.")
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;
    private final AuthService authService;
    private static final String DEFAULT_SORT_COLUMN = "createdAt";

    @GetMapping
    @Operation(summary = "Get user chat history", description = "Retrieves a paginated list of all chat records belonging to the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Chat history retrieved successfully")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(chatHistoryService.getHistoryByUser(userId, pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search user chat history", description = "Searches the user's chat records for the given query term, returning paginated results.")
    @ApiResponse(responseCode = "200", description = "Chat history search results retrieved successfully")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistory(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(chatHistoryService.searchHistoryByUser(userId, q, pageable));
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get chat history by document", description = "Retrieves a paginated list of chat history for a specific document, validated by user ownership.")
    @ApiResponse(responseCode = "200", description = "Document chat history retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(chatHistoryService.getHistoryByDocument(documentId, userId, pageable));
    }

    @GetMapping("/document/{documentId}/search")
    @Operation(summary = "Search chat history by document", description = "Searches chat records for a specific document, validated by user ownership.")
    @ApiResponse(responseCode = "200", description = "Document chat history search results retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryByDocument(
            @PathVariable Long documentId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(chatHistoryService.searchHistoryByDocument(documentId, userId, q, pageable));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get chat history by session", description = "Retrieves a paginated list of chat history for a specific session ID, validated by user context.")
    @ApiResponse(responseCode = "200", description = "Session chat history retrieved successfully")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> getChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(chatHistoryService.getHistoryBySession(sessionId, userId, pageable));
    }

    @GetMapping("/session/{sessionId}/search")
    @Operation(summary = "Search chat history by session", description = "Searches chat records for a specific session ID, validated by user context.")
    @ApiResponse(responseCode = "200", description = "Session chat history search results retrieved successfully")
    public ResponseEntity<PaginatedResponse<ChatHistoryDTO>> searchChatHistoryBySession(
            @PathVariable String sessionId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = authService.getAuthenticatedUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, DEFAULT_SORT_COLUMN));
        return ResponseEntity.ok(chatHistoryService.searchHistoryBySession(sessionId, userId, q, pageable));
    }
}