package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.ChatHistoryService;
import com.TeachMe.TeachMe.service.DocumentHistoryService;
import com.TeachMe.TeachMe.service.PdfExportService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Data Export", description = "Endpoints for exporting user documents, Anki decks, and chat history.")
public class ExportController {

    private final ChatHistoryService chatHistoryService;
    private final DocumentHistoryService documentHistoryService;
    private final AuthService authService;
    private final PdfExportService pdfExportService;

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

    // ==========================================
    // DOCUMENT EXPORTS & PDF GENERATION
    // ==========================================

    @GetMapping("/documents/all")
    @Operation(summary = "Export all user documents", description = "Retrieves all document records uploaded by the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Documents exported successfully")
    public ResponseEntity<List<DocumentHistoryDTO>> exportAllDocuments() {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(documentHistoryService.getAllDocumentsForExport(userId));
    }

    @GetMapping("/documents/{documentId}/pdf")
    @Operation(summary = "Export Document Executive Summary as PDF", description = "Generates a downloadable formatted PDF summary")
    public ResponseEntity<byte[]> exportDocumentPdf(@PathVariable Long documentId) {
        byte[] pdfBytes = pdfExportService.generateSummaryPdf(documentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=TeachMe_Summary_Doc_" + documentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}