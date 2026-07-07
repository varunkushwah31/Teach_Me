package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.ChatHistoryService;
import com.TeachMe.TeachMe.service.DocumentHistoryService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Data Export", description = "Endpoints for exporting user documents and chat history.")
public class ExportController {

    private final ChatHistoryService chatHistoryService;
    private final DocumentHistoryService documentHistoryService;
    private final AuthService authService;

    // ==========================================
    // CHAT EXPORTS
    // ==========================================

    @GetMapping("/chats/all")
    @Operation(summary = "Export all user chats (sorted)", description = "Retrieves all chat history belonging to the authenticated user, sorted by creation date.")
    @ApiResponse(responseCode = "200", description = "Chats exported successfully")
    public ResponseEntity<List<ChatHistoryDTO>> exportAllChats() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.exportUserChatsSorted(userId));
    }

    @GetMapping("/chats/unsorted")
    @Operation(summary = "Export all user chats (unsorted)", description = "Retrieves all chat history belonging to the authenticated user, unsorted.")
    @ApiResponse(responseCode = "200", description = "Chats exported successfully")
    public ResponseEntity<List<ChatHistoryDTO>> exportUnsortedChats() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.exportUserChats(userId));
    }

    @GetMapping("/chats/session/{sessionId}")
    @Operation(summary = "Export session chats", description = "Retrieves all chat history for a specific session ID, validated by user context.")
    @ApiResponse(responseCode = "200", description = "Session chats exported successfully")
    public ResponseEntity<List<ChatHistoryDTO>> exportFullSession(@PathVariable String sessionId) {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.getFullSessionHistory(sessionId, userId));
    }

    @GetMapping("/chats/document/{documentId}")
    @Operation(summary = "Export document chats (sorted)", description = "Retrieves all sorted chat history associated with a specific document, validated by user context.")
    @ApiResponse(responseCode = "200", description = "Document chats exported successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    public ResponseEntity<List<ChatHistoryDTO>> exportChatsByDocument(@PathVariable Long documentId) {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.getChatsForDocumentSorted(documentId, userId));
    }

    @GetMapping("/chats/document/{documentId}/unsorted")
    @Operation(summary = "Export document chats (unsorted)", description = "Retrieves all unsorted chat history associated with a specific document, validated by user context.")
    @ApiResponse(responseCode = "200", description = "Document chats exported successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    public ResponseEntity<List<ChatHistoryDTO>> exportUnsortedChatsByDocument(@PathVariable Long documentId) {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.getChatsForDocument(documentId, userId));
    }

    // ==========================================
    // DOCUMENT EXPORTS
    // ==========================================

    @GetMapping("/documents/all")
    @Operation(summary = "Export all user documents", description = "Retrieves all document records uploaded by the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Documents exported successfully")
    public ResponseEntity<List<DocumentHistoryDTO>> exportAllDocuments() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(documentHistoryService.getAllDocumentsForExport(userId));
    }

    @GetMapping("/documents/unsorted")
    @Operation(summary = "Export unsorted user documents", description = "Retrieves all document records uploaded by the authenticated user, unsorted.")
    @ApiResponse(responseCode = "200", description = "Documents exported successfully")
    public ResponseEntity<List<DocumentHistoryDTO>> exportUnsortedDocuments() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(documentHistoryService.getUnsortedDocuments(userId));
    }

    @GetMapping("/documents/status/{status}")
    @Operation(summary = "Export documents by status", description = "Retrieves user documents filtered by processing status.")
    @ApiResponse(responseCode = "200", description = "Documents exported successfully")
    public ResponseEntity<List<DocumentHistoryDTO>> exportDocumentsByStatus(@PathVariable String status) {
        Long userId = authService.getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(documentHistoryService.getDocumentsByStatusForExport(userId, docStatus));
    }
}