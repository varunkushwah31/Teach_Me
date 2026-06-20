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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final ChatRepository chatRepository;
    private final DocumentRepository documentRepository;

    // Chat History Methods
    public PaginatedResponse<ChatHistoryDTO> getChatHistoryByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chat> chatPage = chatRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<ChatHistoryDTO> dtoPage = chatPage.map(this::convertChatToDTO);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatHistoryDTO> searchChatHistoryByUser(Long userId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chat> chatPage = chatRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        Page<ChatHistoryDTO> dtoPage = chatPage.map(this::convertChatToDTO);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatHistoryDTO> getChatHistoryByDocument(Long documentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chat> chatPage = chatRepository.findByDocumentIdOrderByCreatedAtDesc(documentId, pageable);
        Page<ChatHistoryDTO> dtoPage = chatPage.map(this::convertChatToDTO);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatHistoryDTO> searchChatHistoryByDocument(Long documentId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chat> chatPage = chatRepository.searchByDocumentIdAndTerm(documentId, searchTerm, pageable);
        Page<ChatHistoryDTO> dtoPage = chatPage.map(this::convertChatToDTO);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatHistoryDTO> getChatHistoryBySession(String sessionId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chat> chatPage = chatRepository.findBySessionIdOrderByCreatedAtDesc(sessionId, pageable);
        Page<ChatHistoryDTO> dtoPage = chatPage.map(this::convertChatToDTO);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<ChatHistoryDTO> searchChatHistoryBySession(String sessionId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Chat> chatPage = chatRepository.searchBySessionIdAndTerm(sessionId, searchTerm, pageable);
        Page<ChatHistoryDTO> dtoPage = chatPage.map(this::convertChatToDTO);
        return PaginatedResponse.fromPage(dtoPage);
    }

    // Document History Methods
    public PaginatedResponse<DocumentHistoryDTO> getDocumentHistoryByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> docPage = documentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Page<DocumentHistoryDTO> dtoPage = docPage.map(DocumentHistoryDTO::fromEntity);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<DocumentHistoryDTO> searchDocumentHistoryByUser(Long userId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> docPage = documentRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        Page<DocumentHistoryDTO> dtoPage = docPage.map(DocumentHistoryDTO::fromEntity);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<DocumentHistoryDTO> getDocumentHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> docPage = documentRepository.findByUserIdAndStatus(userId, status, pageable);
        Page<DocumentHistoryDTO> dtoPage = docPage.map(DocumentHistoryDTO::fromEntity);
        return PaginatedResponse.fromPage(dtoPage);
    }

    public PaginatedResponse<DocumentHistoryDTO> searchDocumentHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> docPage = documentRepository.searchByUserIdStatusAndTerm(userId, status, searchTerm, pageable);
        Page<DocumentHistoryDTO> dtoPage = docPage.map(DocumentHistoryDTO::fromEntity);
        return PaginatedResponse.fromPage(dtoPage);
    }

    // Helper method to convert Chat entity to DTO
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
