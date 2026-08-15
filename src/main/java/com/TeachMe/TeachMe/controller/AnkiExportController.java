package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AnkiExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Anki Export", description = "Endpoints for exporting flashcard decks in Anki-compatible CSV format.")
public class AnkiExportController {

    private final AnkiExportService ankiExportService;
    private final UserRepository userRepository;

    @GetMapping("/anki")
    @Operation(summary = "Export Anki deck", description = "Exports all user flashcards as Anki-compatible CSV/TXT file for import into Anki.")
    @ApiResponse(responseCode = "200", description = "Anki deck exported successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    public ResponseEntity<byte[]> exportAnkiDeck(
            @RequestParam(required = false) String deckName,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        byte[] csvBytes = ankiExportService.exportFlashcardsToAnkiCsv(currentUser.getId(), deckName);
        String filename = (deckName != null ? deckName : "TeachMe_Flashcards") + "_Anki.txt";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvBytes);
    }
}
