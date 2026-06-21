package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {

    private final ChatRepository chatRepository;

    @Override
    public PaginatedResponse<ChatHistoryDTO> getHistoryByUser(Long userId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity)); // Assumes fromEntity is added to DTO
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> getHistoryByDocument(Long documentId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByDocumentIdOrderByCreatedAtDesc(documentId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> searchHistoryByDocument(Long documentId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByDocumentIdAndTerm(documentId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> getHistoryBySession(String sessionId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findBySessionIdOrderByCreatedAtDesc(sessionId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> searchHistoryBySession(String sessionId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchBySessionIdAndTerm(sessionId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }
}