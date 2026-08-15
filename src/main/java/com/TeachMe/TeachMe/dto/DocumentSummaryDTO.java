package com.TeachMe.TeachMe.dto;

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
@Schema(description = "Document summary data transfer object with AI-generated executive summary")
public class DocumentSummaryDTO {
    @Schema(description = "Unique identifier of the summary", example = "1")
    private Long id;

    @Schema(description = "Source document ID", example = "5")
    private Long documentId;

    @Schema(description = "Source document name", example = "Research Paper.pdf")
    private String documentName;

    @Schema(description = "AI-generated executive summary of the document", example = "This paper explores the effects of...")
    private String executiveSummary;

    @Schema(description = "Length of the summary in characters", example = "500")
    private Integer summaryLength;

    @Schema(description = "Word count of the original document", example = "5000")
    private Integer wordCount;

    @Schema(description = "Processing status: PENDING, PROCESSING, COMPLETED, FAILED", example = "COMPLETED")
    private String status;

    @Schema(description = "Error message if processing failed", example = "Token limit exceeded")
    private String errorMessage;

    @Schema(description = "Timestamp when the summary was created", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;
}

