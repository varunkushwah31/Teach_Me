package com.TeachMe.TeachMe.security;

import com.TeachMe.TeachMe.exception.RateLimitExceededException;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) {

        // Prefer authenticated identity as the bucket key — far harder to spoof
        // than an IP and avoids punishing all users behind a shared NAT/VPN.
        String bucketKey = resolveAuthenticatedKey();

        if (bucketKey == null) {
            // Unauthenticated path (shouldn't reach here for /api/chat or /api/documents/upload
            // because those are secured but fall back to a sanitized IP as a safety net).
            bucketKey = resolveIpKey(request);
        }

        Bucket tokenBucket = rateLimitingService.resolveBucket(bucketKey);

        if (tokenBucket.tryConsume(1)) {
            return true;
        }

        log.warn("Rate limit exceeded for key: {}", bucketKey);
        throw new RateLimitExceededException(
                "You have exceeded your 10 requests per minute limit. Please wait.");
    }

    /**
     * Returns the authenticated user's email from the SecurityContext, or null
     * if there is no authenticated principal (e.g. the filter hasn't run yet).
     */
    private String resolveAuthenticatedKey() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null
                && !"anonymousUser".equals(auth.getPrincipal())) {
            return "user:" + auth.getName();
        }
        return null;
    }

    /**
     * Fallback: extract the left-most (client) address from X-Forwarded-For,
     * taking only the first value to prevent header-injection spoofing.
     * Falls back to getRemoteAddr() when the header is absent.
     */
    private String resolveIpKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // The left-most entry is the original client; strip any injected suffixes.
            return "ip:" + forwarded.split(",")[0].trim();
        }
        return "ip:" + request.getRemoteAddr();
    }
}