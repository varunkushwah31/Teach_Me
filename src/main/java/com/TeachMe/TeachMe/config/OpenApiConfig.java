package com.TeachMe.TeachMe.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

        private static final String BEARER_JWT_SCHEME = "bearer-jwt";

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("TeachMe RAG Engine API")
                                                .version("1.0.0")
                                                .description("Interactive API documentation for the TeachMe AI-powered local learning platform."))
                                .addSecurityItem(new SecurityRequirement().addList(BEARER_JWT_SCHEME))
                                .components(new Components()
                                                .addSecuritySchemes(BEARER_JWT_SCHEME, new SecurityScheme()
                                                                .name(BEARER_JWT_SCHEME)
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")
                                                                .description("Input your JWT token acquired from /api/auth/login or /api/auth/register.")));
        }
}
