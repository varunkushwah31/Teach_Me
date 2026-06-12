package com.TeachMe.TeachMe.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JobStatusManager {

    // Thread-safe map storing job tracking data
    private final Map<String, String> jobStatuses = new ConcurrentHashMap<>();

    public void updateStatus(String jobId, String status) {
        jobStatuses.put(jobId, status);
    }

    public String getStatus(String jobId) {
        return jobStatuses.getOrDefault(jobId, "UNKNOWN");
    }
}