package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ChatResponse;
import com.TeachMe.TeachMe.dto.DocumentResponse;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final ChatRepository chatRepository;
    private final DocumentRepository documentRepository;

    // ==========================================
    // DOCUMENT REPOSITORY METHODS - WITH PAGINATION
    // ==========================================

    public List<DocumentResponse> getAllUserDocumentsUnsorted(Long userId) {
        // Uses: findByUserId
        return documentRepository.findByUserId(userId).stream()
                .map(this::mapToDocumentResponse).collect(Collectors.toList());
    }

    public List<DocumentResponse> getRecentUserDocuments(Long userId) {
        // Uses: findByUserIdOrderByCreatedAtDesc
        return documentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDocumentResponse).collect(Collectors.toList());
    }

    public List<DocumentResponse> getUserDocumentsByStatus(Long userId, Document.DocumentStatus status) {
        // Uses: findByUserIdAndStatus
        return documentRepository.findByUserIdAndStatus(userId, status).stream()
                .map(this::mapToDocumentResponse).collect(Collectors.toList());
    }

    // Paginated Document Methods
    public PaginatedResponse<DocumentResponse> getRecentUserDocumentsPaged(Long userId, Pageable pageable) {
        Page<Document> docPage = documentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<DocumentResponse> dtoPage = docPage.map(this::mapToDocumentResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<DocumentResponse> getUserDocumentsByStatusPaged(Long userId, Document.DocumentStatus status, Pageable pageable) {
        Page<Document> docPage = documentRepository.findByUserIdAndStatus(userId, status, pageable);
        Page<DocumentResponse> dtoPage = docPage.map(this::mapToDocumentResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<DocumentResponse> searchUserDocuments(Long userId, String searchTerm, Pageable pageable) {
        Page<Document> docPage = documentRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        Page<DocumentResponse> dtoPage = docPage.map(this::mapToDocumentResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<DocumentResponse> searchUserDocumentsByStatus(Long userId, Document.DocumentStatus status, String searchTerm, Pageable pageable) {
        Page<Document> docPage = documentRepository.searchByUserIdStatusAndTerm(userId, status, searchTerm, pageable);
        Page<DocumentResponse> dtoPage = docPage.map(this::mapToDocumentResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    // ==========================================
    // CHAT REPOSITORY METHODS - WITH PAGINATION
    // ==========================================

    public List<ChatResponse> getAllUserChatsUnsorted(Long userId) {
        // Uses: findByUserId
        return chatRepository.findByUserId(userId).stream()
                .map(this::mapToChatResponse).collect(Collectors.toList());
    }

    public List<ChatResponse> getRecentUserChats(Long userId) {
        // Uses: findByUserIdOrderByCreatedAtDesc
        return chatRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToChatResponse).collect(Collectors.toList());
    }

    public List<ChatResponse> getChatsBySession(String sessionId) {
        // Uses: findBySessionId
        return chatRepository.findBySessionId(sessionId).stream()
                .map(this::mapToChatResponse).collect(Collectors.toList());
    }

    public List<ChatResponse> getAllDocumentChatsUnsorted(Long documentId) {
        // Uses: findByDocumentId
        return chatRepository.findByDocumentId(documentId).stream()
                .map(this::mapToChatResponse).collect(Collectors.toList());
    }

    public List<ChatResponse> getRecentDocumentChats(Long documentId) {
        // Uses: findByDocumentIdOrderByCreatedAtDesc
        return chatRepository.findByDocumentIdOrderByCreatedAtDesc(documentId).stream()
                .map(this::mapToChatResponse).collect(Collectors.toList());
    }

    // Paginated Chat Methods
    public PaginatedResponse<ChatResponse> getRecentUserChatsPaged(Long userId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<ChatResponse> dtoPage = chatPage.map(this::mapToChatResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatResponse> searchUserChats(Long userId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        Page<ChatResponse> dtoPage = chatPage.map(this::mapToChatResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatResponse> getRecentDocumentChatsPaged(Long documentId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByDocumentIdOrderByCreatedAtDesc(documentId, pageable);
        Page<ChatResponse> dtoPage = chatPage.map(this::mapToChatResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatResponse> searchDocumentChats(Long documentId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByDocumentIdAndTerm(documentId, searchTerm, pageable);
        Page<ChatResponse> dtoPage = chatPage.map(this::mapToChatResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatResponse> getChatsBySessionPaged(String sessionId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findBySessionIdOrderByCreatedAtDesc(sessionId, pageable);
        Page<ChatResponse> dtoPage = chatPage.map(this::mapToChatResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatResponse> searchChatsBySession(String sessionId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchBySessionIdAndTerm(sessionId, searchTerm, pageable);
        Page<ChatResponse> dtoPage = chatPage.map(this::mapToChatResponse);
        return PaginatedResponse.fromPage(dtoPage);
    }

    // ==========================================
    // MAPPERS
    // ==========================================

    private DocumentResponse mapToDocumentResponse(Document doc) {
        return new DocumentResponse(
                doc.getId(), doc.getFileName(), doc.getFileType(),
                doc.getFileSize(), doc.getStatus().name(), doc.getCreatedAt()
        );
    }

    private ChatResponse mapToChatResponse(Chat chat) {
        return new ChatResponse(
                chat.getId(), chat.getSessionId(), chat.getQuestion(),
                chat.getAnswer(), chat.getCreatedAt()
        );
    }
}