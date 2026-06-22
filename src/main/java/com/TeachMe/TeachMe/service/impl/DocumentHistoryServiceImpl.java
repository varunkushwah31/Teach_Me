package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.dto.DocumentHistoryDTO;
import com.TeachMe.TeachMe.dto.PaginatedResponse;
import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.service.DocumentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentHistoryServiceImpl implements DocumentHistoryService {

    private final DocumentRepository documentRepository;

    @Override
    public PaginatedResponse<DocumentHistoryDTO> getHistoryByUser(Long userId, Pageable pageable) {
        Page<Document> docPage = documentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<DocumentHistoryDTO> searchHistoryByUser(Long userId, String searchTerm, Pageable pageable) {
        Page<Document> docPage = documentRepository.searchByUserIdAndTerm(userId, searchTerm, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<DocumentHistoryDTO> getHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, Pageable pageable) {
        Page<Document> docPage = documentRepository.findByUserIdAndStatus(userId, status, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    @Override
    public PaginatedResponse<DocumentHistoryDTO> searchHistoryByUserAndStatus(Long userId, Document.DocumentStatus status, String searchTerm, Pageable pageable) {
        Page<Document> docPage = documentRepository.searchByUserIdStatusAndTerm(userId, status, searchTerm, pageable);
        return PaginatedResponse.fromPage(docPage.map(DocumentHistoryDTO::fromEntity));
    }

    // Consume the unpaginated List methods for Data Export features
    public List<DocumentHistoryDTO> getAllDocumentsForExport(Long userId) {
        return documentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DocumentHistoryDTO::fromEntity)
                .toList();
    }

    public List<DocumentHistoryDTO> getUnsortedDocuments(Long userId) {
        return documentRepository.findByUserId(userId).stream()
                .map(DocumentHistoryDTO::fromEntity)
                .toList();
    }

    public List<DocumentHistoryDTO> getDocumentsByStatusForExport(Long userId, Document.DocumentStatus status) {
        return documentRepository.findByUserIdAndStatus(userId, status).stream()
                .map(DocumentHistoryDTO::fromEntity)
                .toList();
    }
}