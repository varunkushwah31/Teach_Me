package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.CitationDTO;
import com.TeachMe.TeachMe.service.CitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/citations")
@RequiredArgsConstructor
public class CitationController {

    private final CitationService citationService;

    /**
     * Get citations for a chat
     */
    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<CitationDTO>> getCitationsForChat(@PathVariable Long chatId) {
        try {
            List<CitationDTO> citations = citationService.getCitationsForChat(chatId);
            return ResponseEntity.ok(citations);

        } catch (Exception e) {
            log.error("Failed to fetch citations for chat ID: {}", chatId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}