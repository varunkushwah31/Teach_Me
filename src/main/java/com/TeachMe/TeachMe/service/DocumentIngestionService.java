package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.User;

public interface DocumentIngestionService {
    void healStuckDocuments();
    void ingestPdfAsync(byte[] fileBytes, String originalFilename, Long fileSize,
                        String category, String chatId, String jobId, User currentUser);
}