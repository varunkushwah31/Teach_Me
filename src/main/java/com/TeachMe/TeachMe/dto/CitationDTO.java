package com.TeachMe.TeachMe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitationDTO {
    private Long id;
    private Integer citationIndex;
    private String documentName;
    private Integer pageNumber;
    private String quote;
    private String sourceChunkId;
}

