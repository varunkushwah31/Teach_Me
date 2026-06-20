package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.DocumentIngestionService;
import com.TeachMe.TeachMe.service.JobStatusManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentIngestionService ingestionService;
    private final JobStatusManager jobStatusManager;
    private final UserRepository userRepository; // ✅ Injected the User Repository

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        try {
            // 1. Get the currently logged-in user's email from the Security Context
            String userEmail = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();

            // 2. Fetch the actual User entity from PostgreSQL
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            String jobId = UUID.randomUUID().toString();

            // 3. Pass the User entity and file size down to the async service
            ingestionService.ingestPdfAsync(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    file.getSize(),
                    category,
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