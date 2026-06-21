package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final ChatRepository chatRepository;
    private final DocumentRepository documentRepository;

    // ==========================================
    // CHAT HISTORY METHODS
    // ==========================================

    public PaginatedResponse<ChatHistoryDTO> getChatHistoryByUser(Long userId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(this::convertChatToDTO));
    }

    public PaginatedResponse<ChatHistoryDTO> searchChatHistoryByUser(Long userId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(this::convertChatToDTO));
    }

    public PaginatedResponse<ChatHistoryDTO> getChatHistoryByDocument(Long documentId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByDocumentIdOrderByCreatedAtDesc(documentId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(this::convertChatToDTO));
    }

    public PaginatedResponse<ChatHistoryDTO> searchChatHistoryByDocument(Long documentId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByDocumentIdAndTerm(documentId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(this::convertChatToDTO));
    }

    public PaginatedResponse<ChatHistoryDTO> getChatHistoryBySession(String sessionId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findBySessionIdOrderByCreatedAtDesc(sessionId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(this::convertChatToDTO));
    }

    public PaginatedResponse<ChatHistoryDTO> searchChatHistoryBySession(String sessionId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchBySessionIdAndTerm(sessionId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(this::convertChatToDTO));
    }

    // ==========================================
    // DOCUMENT HISTORY METHODS
    // ==========================================

    public PaginatedResponse<DocumentHistoryDTO> getDocumentHistoryByUser(Long userId, Pageable pageable) {
        Page<Document> docPage = documentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    public PaginatedResponse<DocumentHistoryDTO> searchDocumentHistoryByUser(Long userId, String searchTerm, Pageable pageable) {
        Page<Document> docPage = documentRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    public PaginatedResponse<DocumentHistoryDTO> getDocumentHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, Pageable pageable) {
        Page<Document> docPage = documentRepository.findByUserIdAndStatus(userId, status, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    public PaginatedResponse<DocumentHistoryDTO> searchDocumentHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, String searchTerm, Pageable pageable) {
        Page<Document> docPage = documentRepository.searchByUserIdStatusAndTerm(userId, status, searchTerm, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    // ==========================================
    // HELPER
    // ==========================================

    private ChatHistoryDTO convertChatToDTO(Chat chat) {
        return ChatHistoryDTO.builder()
                .id(chat.getId())
                .sessionId(chat.getSessionId())
                .question(chat.getQuestion())
                .answer(chat.getAnswer())
                .context(chat.getContext())
                .createdAt(chat.getCreatedAt())
                .updatedAt(chat.getUpdatedAt())
                .documentId(chat.getDocument() != null ? chat.getDocument().getId() : null)
                .documentName(chat.getDocument() != null ? chat.getDocument().getFileName() : null)
                .build();
    }
}