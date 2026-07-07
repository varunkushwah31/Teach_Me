package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatHistoryService {
    PaginatedResponse<ChatHistoryDTO> getHistoryByUser(Long userId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> getHistoryByDocument(Long documentId, Long userId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryByDocument(Long documentId, Long userId, String searchTerm, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> getHistoryBySession(String sessionId, Long userId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryBySession(String sessionId, Long userId, String searchTerm, Pageable pageable);
    List<ChatHistoryDTO> getFullSessionHistory(String sessionId, Long userId);
    List<ChatHistoryDTO> exportUserChats(Long userId);
    List<ChatHistoryDTO> exportUserChatsSorted(Long userId);
    List<ChatHistoryDTO> getChatsForDocument(Long documentId, Long userId);
    List<ChatHistoryDTO> getChatsForDocumentSorted(Long documentId, Long userId);
}