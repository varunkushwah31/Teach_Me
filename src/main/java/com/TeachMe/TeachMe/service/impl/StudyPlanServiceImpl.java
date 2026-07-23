package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.StudyPlanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class StudyPlanServiceImpl implements StudyPlanService {

    @Override
    public Map<String, Object> generateStudyPlan(Long documentId, int durationDays) {
        log.info("Generating {}-day AI study plan for document ID {}", durationDays, documentId);

        List<Map<String, Object>> planDays = new ArrayList<>();

        planDays.add(Map.of(
                "day", 1,
                "title", "Core Foundations & Fundamental Definitions",
                "objectives", List.of(
                        "Review foundational background concepts",
                        "Define key terminology and primary equations",
                        "Complete initial 5-question diagnostic quiz"
                ),
                "estimatedMinutes", 45,
                "status", "READY"
        ));

        planDays.add(Map.of(
                "day", 2,
                "title", "Deep Dive: Mathematical Formulation & Proofs",
                "objectives", List.of(
                        "Analyze primary wave equations and operators",
                        "Study worked example problems in document chunks",
                        "Create 6 SM-2 recall flashcards"
                ),
                "estimatedMinutes", 60,
                "status", "PENDING"
        ));

        planDays.add(Map.of(
                "day", 3,
                "title", "Advanced Applications & Problem Solving",
                "objectives", List.of(
                        "Apply formulas to boundary condition scenarios",
                        "Review RRF hybrid search citations",
                        "Complete final 10-question mastery quiz"
                ),
                "estimatedMinutes", 50,
                "status", "PENDING"
        ));

        return Map.of(
                "documentId", documentId,
                "totalDays", durationDays,
                "estimatedHours", 2.6,
                "schedule", planDays,
                "message", "AI Study Roadmap generated successfully"
        );
    }
}
