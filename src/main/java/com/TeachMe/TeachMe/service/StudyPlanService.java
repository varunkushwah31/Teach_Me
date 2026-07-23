package com.TeachMe.TeachMe.service;

import java.util.List;
import java.util.Map;

public interface StudyPlanService {
    Map<String, Object> generateStudyPlan(Long documentId, int durationDays);
}
