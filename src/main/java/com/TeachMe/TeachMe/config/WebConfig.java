package com.TeachMe.TeachMe.config;

import com.TeachMe.TeachMe.security.RateLimitInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply the rate limiter exclusively to the chat and document upload routes
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/chat/**")
                .addPathPatterns("/api/documents/upload");
    }
}