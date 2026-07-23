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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {

    private final ChatRepository chatRepository;

    @Override
    public PaginatedResponse<ChatHistoryDTO> getHistoryByUser(Long userId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> getHistoryByDocument(Long documentId, Long userId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findByDocumentIdAndUserIdOrderByCreatedAtDesc(documentId, userId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> searchHistoryByDocument(Long documentId, Long userId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchByDocumentIdAndUserIdAndTerm(documentId, userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> getHistoryBySession(String sessionId, Long userId, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.findBySessionIdAndUserIdOrderByCreatedAtDesc(sessionId, userId, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<ChatHistoryDTO> searchHistoryBySession(String sessionId, Long userId, String searchTerm, Pageable pageable) {
        Page<Chat> chatPage = chatRepository.searchBySessionIdAndUserIdAndTerm(sessionId, userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(chatPage.map(ChatHistoryDTO::fromEntity));
    }

    @Override
    public List<ChatHistoryDTO> getFullSessionHistory(String sessionId, Long userId) {
        return chatRepository.findBySessionIdAndUserId(sessionId, userId).stream()
                .map(ChatHistoryDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ChatHistoryDTO> getRecent30DaysHistoryByUser(Long userId) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<Chat> recentChats = chatRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, cutoff);

        // If fewer than 30 chats in last 30 days, fallback to top 30 overall
        if (recentChats.size() < 30) {
            recentChats = chatRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId);
        } else if (recentChats.size() > 30) {
            recentChats = recentChats.subList(0, 30);
        }

        return recentChats.stream()
                .map(ChatHistoryDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ChatHistoryDTO> exportUserChats(Long userId) {
        return chatRepository.findByUserId(userId).stream()
                .map(ChatHistoryDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ChatHistoryDTO> exportUserChatsSorted(Long userId) {
        return chatRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ChatHistoryDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ChatHistoryDTO> getChatsForDocument(Long documentId, Long userId) {
        return chatRepository.findByDocumentIdAndUserId(documentId, userId).stream()
                .map(ChatHistoryDTO::fromEntity)
                .toList();
    }

    @Override
    public List<ChatHistoryDTO> getChatsForDocumentSorted(Long documentId, Long userId) {
        return chatRepository.findByDocumentIdAndUserIdOrderByCreatedAtDesc(documentId, userId).stream()
                .map(ChatHistoryDTO::fromEntity)
                .toList();
    }
}