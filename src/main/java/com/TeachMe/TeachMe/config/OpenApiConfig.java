package com.TeachMe.TeachMe.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_JWT_SCHEME = "bearer-jwt";

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${spring.application.name:TeachMe}") String appName,
            @Value("${server.port:8081}") String serverPort,
            @Value("${info.app.version:1.0.0}") String appVersion,
            @Value("${info.app.description:Enterprise RAG Pipeline}") String appDescription) {
        Server devServer = new Server()
                .url("http://localhost:" + serverPort)
                .description("Development Server");
        
        Server prodServer = new Server()
                .url("https://api.teachme.example.com")
                .description("Production Server");

        return new OpenAPI()
                .servers(List.of(devServer, prodServer))
                .info(new Info()
                        .title(appName + " API")
                        .version(appVersion)
                        .description(appDescription + " - Interactive API documentation for the TeachMe AI-powered local learning platform.")
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
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
