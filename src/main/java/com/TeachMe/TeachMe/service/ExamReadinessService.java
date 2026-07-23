package com.TeachMe.TeachMe.service;

import java.util.Map;

public interface ExamReadinessService {
    Map<String, Object> calculateReadiness(Long documentId, Long userId);
}
