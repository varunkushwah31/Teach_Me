package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.DocumentIngestionService;
import com.TeachMe.TeachMe.service.JobStatusManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        try {
            String jobId = UUID.randomUUID().toString();

            //  Pass an InputStream because MultipartFile lifecycle ends when HTTP request finishes
            ingestionService.ingestPdfAsync(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    category,
                    jobId
            );

            // Return 202 HTTP Status (Accepted) instantly
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "message", "File upload accepted. Processing started in background.",
                    "jobId", jobId
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to initialize upload: " + e.getMessage()));
        }
    }

    // Polling endpoint for checking the async job status
    @GetMapping("/status/{jobId}")
    public ResponseEntity<Map<String, String>> getJobStatus(@PathVariable String jobId) {
        String status = jobStatusManager.getStatus(jobId);
        return ResponseEntity.ok(Map.of(
                "jobId", jobId,
                "status", status
        ));
    }
}