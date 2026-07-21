package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.CitationDTO;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.Citation;
import com.TeachMe.TeachMe.repository.CitationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@Transactional
public class CitationService {

    private final CitationRepository citationRepository;

    public CitationService(CitationRepository citationRepository) {
        this.citationRepository = citationRepository;
    }

    public void extractAndSaveCitations(Chat chat, String aiResponse, List<Document> sourceDocs) {
        log.info("Extracting citations from AI response");

        List<Citation> citations = new ArrayList<>();

        Pattern citationPattern = Pattern.compile("\\[(\\d+)]");
        Matcher matcher = citationPattern.matcher(aiResponse);

        java.util.Set<Integer> processedSourceIndices = new java.util.HashSet<>();

        while (matcher.find()) {
            int docNumber = Integer.parseInt(matcher.group(1));
            int sourceIndex = docNumber - 1;

            if (sourceIndex >= 0 && sourceIndex < sourceDocs.size() && processedSourceIndices.add(sourceIndex)) {
                Document sourceDoc = sourceDocs.get(sourceIndex);
                String sourceChunk = sourceDoc.getText();
                String docName = sourceDoc.getMetadata().containsKey("fileName")
                        ? String.valueOf(sourceDoc.getMetadata().get("fileName"))
                        : "Unknown";

                Citation citation = Citation.builder()
                        .chat(chat)
                        .citationIndex(docNumber)
                        .documentName(docName)
                        .pageNumber(sourceChunk != null ? extractPageNumber(sourceChunk) : null)
                        .quote(sourceChunk != null ? extractQuote(sourceChunk) : "")
                        .sourceChunkId(sourceDoc.getId())
                        .build();

                citations.add(citation);
            }
        }

        citationRepository.saveAll(citations);
    }

    private Integer extractPageNumber(String chunk) {
        Pattern pagePattern = Pattern.compile("page[:\\s]*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pagePattern.matcher(chunk);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    private String extractQuote(String chunk) {
        if (chunk.length() > 100) {
            return chunk.substring(0, 100) + "...";
        }
        return chunk;
    }

    public List<CitationDTO> getCitationsForChat(Long chatId) {
        return citationRepository.findByChatId(chatId).stream()
                .map(this::mapToDTO)
                .toList(); // ✅ Modern Java Streams
    }

    // The deleteCitationsForChat method was removed because cascading deletes on the
    // Chat entity will automatically delete orphaned citations.

    private CitationDTO mapToDTO(Citation citation) {
        return CitationDTO.builder()
                .id(citation.getId())
                .citationIndex(citation.getCitationIndex())
                .documentName(citation.getDocumentName())
                .pageNumber(citation.getPageNumber())
                .quote(citation.getQuote())
                .sourceChunkId(citation.getSourceChunkId())
                .build();
    }
}