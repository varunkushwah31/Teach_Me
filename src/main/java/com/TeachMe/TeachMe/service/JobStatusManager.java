package com.TeachMe.TeachMe.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Tracks background ingestion job statuses keyed by job ID.
 *
 * <p>The previous implementation used a raw {@link java.util.concurrent.ConcurrentHashMap}
 * with no eviction policy. On a long-running server, every job ID ever submitted
 * would accumulate indefinitely — a slow memory leak. This version uses a
 * Caffeine cache that automatically evicts entries 1 hour after they are written,
 * which is far longer than any user would poll for a status update.
 */
@Component
public class JobStatusManager {

    private final Cache<String, String> jobStatuses = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .maximumSize(10_000)
            .build();

    public void updateStatus(String jobId, String status) {
        jobStatuses.put(jobId, status);
    }

    public String getStatus(String jobId) {
        String status = jobStatuses.getIfPresent(jobId);
        return status != null ? status : "UNKNOWN";
    }
}