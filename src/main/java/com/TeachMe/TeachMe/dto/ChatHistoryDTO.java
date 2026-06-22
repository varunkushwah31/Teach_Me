package com.TeachMe.TeachMe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.TeachMe.TeachMe.entity.Chat;
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
public class ChatHistoryDTO {
    private Long id;
    private String sessionId;
    private String question;
    private String answer;
    private String context;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("documentId")
    private Long documentId;

    @JsonProperty("documentName")
    private String documentName;

    @JsonProperty("citations")
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
                .build();
    }
}