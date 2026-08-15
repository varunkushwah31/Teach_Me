package com.TeachMe.TeachMe.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Analytics and metadata extracted from a processed document")
public class DocumentAnalyticsDTO {
    @Schema(description = "Unique identifier of the document", example = "5")
    private Long documentId;

    @Schema(description = "Original filename of the uploaded document", example = "Biology Textbook.pdf")
    private String documentName;

    @Schema(description = "Total word count in the document", example = "15420")
    private long totalWords;

    @Schema(description = "Estimated reading time in minutes (based on 200 wpm)", example = "77.1")
    private double estimatedReadingTimeMinutes;

    @Schema(description = "Number of text chunks created during ingestion", example = "45")
    private int chunkCount;

    @Schema(description = "Flesch-Kincaid readability grade level", example = "12.3")
    private String readabilityGradeLevel;

    @Schema(description = "Top keywords extracted from the document", example = "[\"photosynthesis\", \"chloroplast\", \"light energy\"]")
    private List<String> topExtractedKeywords;
}
