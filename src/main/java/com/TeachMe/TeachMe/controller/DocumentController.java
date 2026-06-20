package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.DocumentIngestionService;
import com.TeachMe.TeachMe.service.JobStatusManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentIngestionService ingestionService;
    private final JobStatusManager jobStatusManager;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatId") String chatId,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User is not authenticated"));
            }

            String userEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            String jobId = UUID.randomUUID().toString();

            // ✅ Correctly passes 7 parameters down to match the new Service signature
            ingestionService.ingestPdfAsync(
                    file.getInputStream(),
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
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to initialize upload: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<Map<String, String>> getJobStatus(@PathVariable String jobId) {
        String status = jobStatusManager.getStatus(jobId);
        return ResponseEntity.ok(Map.of(
                "jobId", jobId,
                "status", status
        ));
    }
}