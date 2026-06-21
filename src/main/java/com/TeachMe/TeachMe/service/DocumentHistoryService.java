package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Document;
import org.springframework.data.domain.Pageable;

public interface DocumentHistoryService {
    PaginatedResponse<DocumentHistoryDTO> getHistoryByUser(Long userId, Pageable pageable);
    PaginatedResponse<DocumentHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable);
    PaginatedResponse<DocumentHistoryDTO> getHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, Pageable pageable);
    PaginatedResponse<DocumentHistoryDTO> searchHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, String searchTerm, Pageable pageable);
}