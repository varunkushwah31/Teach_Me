package com.TeachMe.TeachMe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Generic paginated response wrapper")
public class PaginatedResponse<T> {
    @Schema(description = "List of items on the current page")
    private List<T> content;

    @JsonProperty("currentPage")
    @Schema(description = "Zero-based current page number", example = "0")
    private int currentPage;

    @JsonProperty("pageSize")
    @Schema(description = "Number of items per page", example = "20")
    private int pageSize;

    @JsonProperty("totalElements")
    @Schema(description = "Total number of items across all pages", example = "150")
    private long totalElements;

    @JsonProperty("totalPages")
    @Schema(description = "Total number of pages", example = "8")
    private int totalPages;

    @JsonProperty("isFirst")
    @Schema(description = "Whether this is the first page", example = "true")
    private boolean isFirst;

    @JsonProperty("isLast")
    @Schema(description = "Whether this is the last page", example = "false")
    private boolean isLast;

    @JsonProperty("hasNext")
    @Schema(description = "Whether there is a next page", example = "true")
    private boolean hasNext;

    @JsonProperty("hasPrevious")
    @Schema(description = "Whether there is a previous page", example = "false")
    private boolean hasPrevious;

    public static <T> PaginatedResponse<T> fromPage(Page<T> page) {
        return PaginatedResponse.<T>builder()
                .content(page.getContent())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
