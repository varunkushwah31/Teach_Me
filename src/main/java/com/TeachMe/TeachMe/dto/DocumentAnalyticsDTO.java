package com.TeachMe.TeachMe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentAnalyticsDTO {
    private Long documentId;
    private String documentName;
    private long totalWords;
    private double estimatedReadingTimeMinutes;
    private int chunkCount;
    private String readabilityGradeLevel;
    private List<String> topExtractedKeywords;
}
