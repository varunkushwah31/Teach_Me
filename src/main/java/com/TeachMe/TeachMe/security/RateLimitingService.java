package com.TeachMe.TeachMe.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Maintains one token bucket per rate-limit key (user email in normal operation,
 * IP address as an unauthenticated fallback).
 *
 * <p>The previous implementation stored buckets in a raw {@link java.util.concurrent.ConcurrentHashMap}.
 * Buckets were never evicted, so memory grew without a bound on a long-running server.
 * This version evicts entries 2 minutes after last access, which is safely longer than
 * the 1-minute refill window defined in the bucket bandwidth — stale buckets are gone
 * before they could accumulate in meaningful numbers.
 */
@Service
public class RateLimitingService {

    private final Cache<String, Bucket> cache = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.MINUTES)
            .maximumSize(50_000)
            .build();

    public Bucket resolveBucket(String key) {
        return cache.get(key, k -> newBucket());
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}