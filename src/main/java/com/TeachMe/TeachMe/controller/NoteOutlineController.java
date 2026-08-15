package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.NoteOutlineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "Hierarchical Note Outline", description = "Endpoints for generating structured study outlines and formula cheatsheets")
public class NoteOutlineController {

    private final NoteOutlineService noteOutlineService;

    @GetMapping("/{documentId}/outline")
    @Operation(summary = "Generate Hierarchical Study Outline", description = "Generates structured bulleted outlines and key mathematical formula cheat sheets for document notes")
    @ApiResponse(responseCode = "200", description = "Study outline generated successfully")
    @ApiResponse(responseCode = "404", description = "Document not found")
    public ResponseEntity<Map<String, Object>> getOutline(@PathVariable Long documentId) {
        return ResponseEntity.ok(noteOutlineService.generateOutline(documentId));
    }
}
