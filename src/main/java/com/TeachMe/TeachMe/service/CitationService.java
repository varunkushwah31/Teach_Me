package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.CitationDTO;
import com.TeachMe.TeachMe.entity.Chat;
import org.springframework.ai.document.Document;
import java.util.List;

public interface CitationService {
    void extractAndSaveCitations(Chat chat, String aiResponse, List<Document> sourceDocs);
    List<CitationDTO> getCitationsForChat(Long chatId);
}