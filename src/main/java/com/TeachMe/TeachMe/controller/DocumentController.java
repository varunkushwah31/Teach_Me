package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.DocumentIngestionService;
import com.TeachMe.TeachMe.service.JobStatusManager;
import com.TeachMe.TeachMe.service.QuizGenerationService;
import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Endpoints for uploading PDFs, checking ingestion status, and triggering study generation.")
public class DocumentController {

    private final DocumentIngestionService ingestionService;
    private final QuizGenerationService quizGenerationService;
    private final JobStatusManager jobStatusManager;
    private final UserRepository userRepository;
    private final AuthService authService;

    private static final String ERROR_KEY = "error";

    @PostMapping("/upload")
    @Operation(summary = "Upload PDF document", description = "Accepts a PDF document upload, and launches an asynchronous background ingestion job to parse and embed it.")
    @ApiResponse(responseCode = "202", description = "Document accepted for background processing")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    public ResponseEntity<Map<String, String>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatId") String chatId,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found in repository"));

            String jobId = UUID.randomUUID().toString();

            byte[] fileBytes = file.getBytes();

            ingestionService.ingestPdfAsync(
                    fileBytes,
                    file.getOriginalFilename(),
                    file.getSize(),
                    category,
                    chatId,
                    jobId,
                    currentUser
            );

            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "message", "File upload accepted. Processing started in background.",
                    "jobId", jobId
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(ERROR_KEY, "Failed to initialize upload: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{jobId}")
    @Operation(summary = "Get ingestion job status", description = "Checks the background processing status (e.g. PROCESSING, COMPLETED, FAILED) of a document upload job.")
    @ApiResponse(responseCode = "200", description = "Job status retrieved successfully")
    public ResponseEntity<Map<String, String>> getJobStatus(@PathVariable String jobId) {
        String status = jobStatusManager.getStatus(jobId);
        return ResponseEntity.ok(Map.of(
                "jobId", jobId,
                "status", status
        ));
    }

    @PostMapping("/{documentId}/generate-quiz")
    @Operation(summary = "Generate quiz from library", description = "Triggers multiple-choice quiz generation for a document in the library, validating user ownership.")
    @ApiResponse(responseCode = "201", description = "Quiz generated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    public ResponseEntity<Map<String, Object>> generateDocumentQuiz(@PathVariable Long documentId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found in repository"));

            QuizDTO quiz = quizGenerationService.generateQuiz(documentId, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Quiz generated successfully",
                    "quiz", quiz
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to generate quiz: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete uploaded document", description = "Permanently deletes an uploaded document, associated pgvector embeddings, and related study materials, validating user ownership.")
    @ApiResponse(responseCode = "200", description = "Document deleted successfully")
    @ApiResponse(responseCode = "403", description = "Access denied: Document not owned by user")
    @ApiResponse(responseCode = "404", description = "Document not found")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable Long documentId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found in repository"));

            ingestionService.deleteDocument(documentId, currentUser);

            return ResponseEntity.ok(Map.of(
                    "message", "Document deleted successfully",
                    "documentId", documentId
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(ERROR_KEY, e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(ERROR_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to delete document: " + e.getMessage()));
        }
    }
}