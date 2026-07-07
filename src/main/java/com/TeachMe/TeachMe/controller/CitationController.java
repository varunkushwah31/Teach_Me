package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.CitationDTO;
import com.TeachMe.TeachMe.service.CitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.entity.Chat;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/citations")
@RequiredArgsConstructor
@Tag(name = "Citations", description = "Endpoints for retrieving verifiable citations and footnotes for chats.")
public class CitationController {

    private final CitationService citationService;
    private final ChatRepository chatRepository;
    private final AuthService authService;

    /**
     * Get citations for a chat
     */
    @GetMapping("/chat/{chatId}")
    @Operation(summary = "Get chat citations", description = "Retrieves the list of document source citations generated for a specific chat message, validated by user ownership.")
    @ApiResponse(responseCode = "200", description = "Citations retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Chat not owned by user")
    @ApiResponse(responseCode = "404", description = "Chat not found")
    public ResponseEntity<List<CitationDTO>> getCitationsForChat(@PathVariable Long chatId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            Optional<Chat> chatOpt = chatRepository.findById(chatId);
            
            if (chatOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            if (!chatOpt.get().getUser().getId().equals(userId)) {
                log.warn("User {} attempted to fetch citations for chat {} they do not own", userId, chatId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<CitationDTO> citations = citationService.getCitationsForChat(chatId);
            return ResponseEntity.ok(citations);

        } catch (Exception e) {
            log.error("Failed to fetch citations for chat ID: {}", chatId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}