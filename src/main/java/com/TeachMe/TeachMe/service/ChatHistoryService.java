package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatHistoryService {
    PaginatedResponse<ChatHistoryDTO> getHistoryByUser(Long userId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> getHistoryByDocument(Long documentId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryByDocument(Long documentId, String searchTerm, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> getHistoryBySession(String sessionId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryBySession(String sessionId, String searchTerm, Pageable pageable);
    List<ChatHistoryDTO> getFullSessionHistory(String sessionId);
    List<ChatHistoryDTO> exportUserChats(Long userId);
    List<ChatHistoryDTO> exportUserChatsSorted(Long userId);
    List<ChatHistoryDTO> getChatsForDocument(Long documentId);
    List<ChatHistoryDTO> getChatsForDocumentSorted(Long documentId);
}