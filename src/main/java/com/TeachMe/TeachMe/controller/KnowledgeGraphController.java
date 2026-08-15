package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.KnowledgeGraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Knowledge Graph Controller", description = "Extract Concept Knowledge Graph Nodes & Edges")
public class KnowledgeGraphController {

    private final KnowledgeGraphService knowledgeGraphService;

    @GetMapping("/{id}/knowledge-graph")
    @Operation(summary = "Extract Knowledge Graph", description = "Returns core academic concept nodes and directional relationship links")
    @ApiResponse(responseCode = "200", description = "Knowledge graph extracted successfully")
    @ApiResponse(responseCode = "404", description = "Document not found")
    public ResponseEntity<Map<String, Object>> getKnowledgeGraph(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeGraphService.extractKnowledgeGraph(id));
    }
}
