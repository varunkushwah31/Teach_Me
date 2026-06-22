package com.TeachMe.TeachMe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSummaryDTO {
    private Long id;
    private Long documentId;
    private String documentName;
    private String executiveSummary;
    private Integer summaryLength;
    private Integer wordCount;
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED
    private String errorMessage;
    private LocalDateTime createdAt;
}

