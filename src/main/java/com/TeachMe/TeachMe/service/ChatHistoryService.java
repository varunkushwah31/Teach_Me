package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.ChatHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import org.springframework.data.domain.Pageable;

public interface ChatHistoryService {
    PaginatedResponse<ChatHistoryDTO> getHistoryByUser(Long userId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> getHistoryByDocument(Long documentId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryByDocument(Long documentId, String searchTerm, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> getHistoryBySession(String sessionId, Pageable pageable);
    PaginatedResponse<ChatHistoryDTO> searchHistoryBySession(String sessionId, String searchTerm, Pageable pageable);
}