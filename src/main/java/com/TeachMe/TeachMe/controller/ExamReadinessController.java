package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.ExamReadinessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/readiness")
@RequiredArgsConstructor
@Tag(name = "AI Exam Readiness", description = "Endpoints for calculating student exam preparedness score and targeted study recommendations")
public class ExamReadinessController {

    private final ExamReadinessService examReadinessService;
    private final AuthService authService;

    @GetMapping("/calculate/{documentId}")
    @Operation(summary = "Calculate AI Exam Readiness", description = "Calculates preparedness score (0-100%) and targeted review recommendations")
    public ResponseEntity<Map<String, Object>> calculateReadiness(@PathVariable Long documentId) {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(examReadinessService.calculateReadiness(documentId, userId));
    }
}
