package com.TeachMe.TeachMe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.TeachMe.TeachMe.entity.Chat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Chat history entry with question, answer, and RAG citations")
public class ChatHistoryDTO {
    @Schema(description = "Unique identifier of the chat entry", example = "1")
    private Long id;

    @Schema(description = "Session identifier for grouping related messages", example = "session-abc123")
    private String sessionId;

    @Schema(description = "User's question", example = "What is photosynthesis?")
    private String question;

    @Schema(description = "AI-generated answer with document context", example = "Photosynthesis is the process by which plants convert...")
    private String answer;

    @Schema(description = "Relevant document context used for the answer")
    private String context;

    @Schema(description = "Timestamp when the chat entry was created", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when the chat entry was last updated", example = "2025-01-15T10:30:00")
    private LocalDateTime updatedAt;

    @JsonProperty("documentId")
    @Schema(description = "Source document ID", example = "5")
    private Long documentId;

    @JsonProperty("documentName")
    @Schema(description = "Source document name", example = "Biology Textbook.pdf")
    private String documentName;

    @JsonProperty("citations")
    @Schema(description = "List of citations referencing source document chunks")
    private List<CitationDTO> citations;

    // Added the static mapping method here
    public static ChatHistoryDTO fromEntity(Chat chat) {
        return ChatHistoryDTO.builder()
                .id(chat.getId())
                .sessionId(chat.getSessionId())
                .question(chat.getQuestion())
                .answer(chat.getAnswer())
                .context(chat.getContext())
                .createdAt(chat.getCreatedAt())
                .updatedAt(chat.getUpdatedAt())
                // Safely handle lazy-loaded document relationships to avoid NullPointerExceptions
                .documentId(chat.getDocument() != null ? chat.getDocument().getId() : null)
                .documentName(chat.getDocument() != null ? chat.getDocument().getFileName() : null)
                .citations(chat.getCitations() != null ? chat.getCitations().stream()
                        .map(c -> CitationDTO.builder()
                                .id(c.getId())
                                .citationIndex(c.getCitationIndex())
                                .documentName(c.getDocumentName())
                                .pageNumber(c.getPageNumber())
                                .quote(c.getQuote())
                                .sourceChunkId(c.getSourceChunkId())
                                .build())
                        .toList() : List.of())
                .build();
    }
}