package com.TeachMe.TeachMe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.TeachMe.TeachMe.entity.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentHistoryDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("errorMessage")
    private String errorMessage;

    public static DocumentHistoryDTO fromEntity(Document document) {
        return DocumentHistoryDTO.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .description(document.getDescription())
                .status(document.getStatus().toString())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .errorMessage(document.getErrorMessage())
                .build();
    }
}
