package com.TeachMe.TeachMe.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Citation referencing a specific chunk of a source document")
public class CitationDTO {
    @Schema(description = "Unique identifier of the citation", example = "1")
    private Long id;

    @Schema(description = "Sequential index of this citation in the answer", example = "1")
    private Integer citationIndex;

    @Schema(description = "Name of the source document", example = "Biology Textbook.pdf")
    private String documentName;

    @Schema(description = "Page number in the source document", example = "15")
    private Integer pageNumber;

    @Schema(description = "Direct quote from the source document", example = "Photosynthesis converts light energy into chemical energy.")
    private String quote;

    @Schema(description = "Vector store chunk identifier for retrieval", example = "chunk-abc123")
    private String sourceChunkId;
}

