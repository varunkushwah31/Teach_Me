package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ChatResponse;
import com.TeachMe.TeachMe.dto.DocumentResponse;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final ChatRepository chatRepository;
    private final DocumentRepository documentRepository;

    // ==========================================
    // DOCUMENT REPOSITORY METHODS
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

    // ==========================================
    // CHAT REPOSITORY METHODS
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