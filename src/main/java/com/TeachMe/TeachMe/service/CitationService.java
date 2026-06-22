package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.CitationDTO;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.Citation;
import com.TeachMe.TeachMe.repository.CitationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class CitationService {

    private final CitationRepository citationRepository;

    public CitationService(CitationRepository citationRepository) {
        this.citationRepository = citationRepository;
    }

    public List<CitationDTO> extractAndSaveCitations(Chat chat, String aiResponse, List<String> sourceChunks) {
        log.info("Extracting citations from AI response");

        List<Citation> citations = new ArrayList<>();

        Pattern citationPattern = Pattern.compile("\\[(\\d+)]");
        Matcher matcher = citationPattern.matcher(aiResponse);

        int citationIndex = 1;
        while (matcher.find()) {
            int sourceIndex = Integer.parseInt(matcher.group(1)) - 1;

            if (sourceIndex >= 0 && sourceIndex < sourceChunks.size()) {
                String sourceChunk = sourceChunks.get(sourceIndex);

                Citation citation = Citation.builder()
                        .chat(chat)
                        .citationIndex(citationIndex)
                        .documentName(chat.getDocument() != null ? chat.getDocument().getFileName() : "Unknown")
                        .pageNumber(extractPageNumber(sourceChunk))
                        .quote(extractQuote(sourceChunk))
                        .sourceChunkId(String.valueOf(sourceIndex))
                        .build();

                citations.add(citation);
                citationIndex++;
            }
        }

        List<Citation> saved = citationRepository.saveAll(citations);
        log.info("Saved {} citations for chat {}", saved.size(), chat.getId());

        // ✅ Modern Java Streams
        return saved.stream()
                .map(this::mapToDTO)
                .toList();
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