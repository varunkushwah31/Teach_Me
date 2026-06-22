package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.ChatHistoryService;
import com.TeachMe.TeachMe.service.DocumentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ChatHistoryService chatHistoryService;
    private final DocumentHistoryService documentHistoryService;
    private final AuthService authService;

    // ==========================================
    // CHAT EXPORTS
    // ==========================================

    @GetMapping("/chats/all")
    public ResponseEntity<List<ChatHistoryDTO>> exportAllChats() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.exportUserChatsSorted(userId));
    }

    @GetMapping("/chats/unsorted")
    public ResponseEntity<List<ChatHistoryDTO>> exportUnsortedChats() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(chatHistoryService.exportUserChats(userId));
    }

    @GetMapping("/chats/session/{sessionId}")
    public ResponseEntity<List<ChatHistoryDTO>> exportFullSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(chatHistoryService.getFullSessionHistory(sessionId));
    }

    @GetMapping("/chats/document/{documentId}")
    public ResponseEntity<List<ChatHistoryDTO>> exportChatsByDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(chatHistoryService.getChatsForDocumentSorted(documentId));
    }

    @GetMapping("/chats/document/{documentId}/unsorted")
    public ResponseEntity<List<ChatHistoryDTO>> exportUnsortedChatsByDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(chatHistoryService.getChatsForDocument(documentId));
    }

    // ==========================================
    // DOCUMENT EXPORTS
    // ==========================================

    @GetMapping("/documents/all")
    public ResponseEntity<List<DocumentHistoryDTO>> exportAllDocuments() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(documentHistoryService.getAllDocumentsForExport(userId));
    }

    @GetMapping("/documents/unsorted")
    public ResponseEntity<List<DocumentHistoryDTO>> exportUnsortedDocuments() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(documentHistoryService.getUnsortedDocuments(userId));
    }

    @GetMapping("/documents/status/{status}")
    public ResponseEntity<List<DocumentHistoryDTO>> exportDocumentsByStatus(@PathVariable String status) {
        Long userId = authService.getAuthenticatedUserId();
        Document.DocumentStatus docStatus = Document.DocumentStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(documentHistoryService.getDocumentsByStatusForExport(userId, docStatus));
    }
}