package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.DocumentSummaryDTO;

public interface DocumentSummarizationService {
    void generateSummaryAsync(Long documentId);
    DocumentSummaryDTO getSummary(Long documentId);
}