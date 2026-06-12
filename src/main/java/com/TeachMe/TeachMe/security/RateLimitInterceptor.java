package com.TeachMe.TeachMe.security;

import com.TeachMe.TeachMe.exception.RateLimitExceededException;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        // Extract the user's IP Address
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }

        // Fetch their specific token bucket
        Bucket tokenBucket = rateLimitingService.resolveBucket(ipAddress);

        // Try to consume 1 token
        if (tokenBucket.tryConsume(1)) {
            // Success! Let the request proceed to the Controller
            return true;
        } else {
            // Failure! Block the request and throw our custom exception
            throw new RateLimitExceededException("You have exceeded your 10 requests per minute limit. Please wait.");
        }
    }
}