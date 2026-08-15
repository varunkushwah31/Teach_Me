package com.TeachMe.TeachMe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.TeachMe.TeachMe.entity.Document;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Document history entry with processing status and metadata")
public class DocumentHistoryDTO {
    @Schema(description = "Unique document identifier", example = "1")
    private Long id;

    @Schema(description = "Original file name", example = "research-paper.pdf")
    private String fileName;

    @Schema(description = "File MIME type", example = "application/pdf")
    private String fileType;

    @Schema(description = "File size in bytes", example = "2048576")
    private Long fileSize;

    @Schema(description = "User-provided description", example = "Machine learning research paper")
    private String description;

    @Schema(description = "Processing status: PENDING, PROCESSING, COMPLETED, FAILED", example = "COMPLETED")
    private String status;

    @Schema(description = "Timestamp when document was uploaded", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when document was last updated", example = "2025-01-15T11:45:00")
    private LocalDateTime updatedAt;

    @JsonProperty("errorMessage")
    @Schema(description = "Error message if processing failed", example = "Token limit exceeded")
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
