package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.StudyPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/study-plan")
@RequiredArgsConstructor
@Tag(name = "Study Plan Controller", description = "AI Study Roadmap & Syllabus Generator Endpoints")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    @PostMapping("/generate/{documentId}")
    @Operation(summary = "Generate Day-by-Day Study Plan", description = "Creates a structured study roadmap with daily objectives and review tasks")
    @ApiResponse(responseCode = "200", description = "Study plan generated successfully")
    @ApiResponse(responseCode = "404", description = "Document not found")
    public ResponseEntity<Map<String, Object>> generateStudyPlan(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "3") int days) {
        return ResponseEntity.ok(studyPlanService.generateStudyPlan(documentId, days));
    }
}
