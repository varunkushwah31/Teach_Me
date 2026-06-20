package com.TeachMe.TeachMe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
}
