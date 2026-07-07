package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.RefreshTokenRepository;
import com.TeachMe.TeachMe.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.cache.CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        if (cacheManager != null) {
            org.springframework.cache.Cache cache = cacheManager.getCache("users");
            if (cache != null) {
                cache.clear();
            }
        }

        refreshTokenRepository.deleteAll();
        userRepository.findByEmail("admin@teachme.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("newuser@teachme.com").ifPresent(userRepository::delete);

        userRepository.save(User.builder()
                .email("admin@teachme.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Admin")
                .lastName("User")
                .build());
    }

    @Test
    void shouldReturnJwtTokenForValidCredentials() throws Exception {
        String validLoginJson = """
                {
                    "email": "admin@teachme.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLoginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void shouldReturn401ForInvalidCredentials() throws Exception {
        String invalidLoginJson = """
                {
                    "email": "admin@teachme.com",
                    "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidLoginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRegisterAndReturnTokens() throws Exception {
        String registerJson = """
                {
                    "email": "newuser@teachme.com",
                    "password": "password123",
                    "firstName": "New",
                    "lastName": "User"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void shouldRotateTokensUsingRefreshToken() throws Exception {
        String loginJson = """
                {
                    "email": "admin@teachme.com",
                    "password": "password123"
                }
                """;

        String responseString = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, String> responseMap = mapper.readValue(responseString, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        String refreshToken = responseMap.get("refreshToken");

        String refreshRequestJson = String.format("""
                {
                    "refreshToken": "%s"
                }
                """, refreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void shouldLogoutSuccessfully() throws Exception {
        String loginJson = """
                {
                    "email": "admin@teachme.com",
                    "password": "password123"
                }
                """;

        String responseString = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, String> responseMap = mapper.readValue(responseString, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        String refreshToken = responseMap.get("refreshToken");

        String logoutRequestJson = String.format("""
                {
                    "refreshToken": "%s"
                }
                """, refreshToken);

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(logoutRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
}