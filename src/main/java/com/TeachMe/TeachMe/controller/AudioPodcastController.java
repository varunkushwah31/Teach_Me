package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AudioPodcastService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/audio")
@RequiredArgsConstructor
@Tag(name = "Audio Podcast Controller", description = "Endpoints for 2-Speaker AI Study Podcast Generation & Streaming")
public class AudioPodcastController {

    private final AudioPodcastService audioPodcastService;

    @PostMapping("/generate-podcast/{documentId}")
    @Operation(summary = "Generate 2-Speaker AI Podcast", description = "Generates a NotebookLM-style 2-speaker audio dialogue breakdown of document notes")
    public ResponseEntity<Map<String, Object>> generatePodcast(@PathVariable Long documentId) {
        return ResponseEntity.ok(audioPodcastService.generatePodcastScript(documentId));
    }
}
