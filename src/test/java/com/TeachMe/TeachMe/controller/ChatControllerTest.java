package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.RagChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import reactor.core.publisher.Flux;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;

import org.junit.jupiter.api.BeforeEach;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import java.time.Duration;
import static org.mockito.ArgumentMatchers.anyString;

@ActiveProfiles("test")
@WebMvcTest(ChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatControllerTest {

    @MockitoBean
    private VectorStore vectorStore;

    @MockitoBean
    private ChatModel chatModel;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RagChatService ragChatService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private com.TeachMe.TeachMe.security.RateLimitingService rateLimitingService;

    @MockitoBean
    private com.TeachMe.TeachMe.security.JwtService jwtService;

    @MockitoBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        Bucket bucket = Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(100).refillGreedy(100, Duration.ofMinutes(1)).build())
                .build();
        when(rateLimitingService.resolveBucket(anyString())).thenReturn(bucket);
    }

    @Test
    @WithMockUser(username = "test@teachme.com")
    void shouldStreamChatResponseSuccessfully() throws Exception {
        // Arrange
        String question = "What is AI?";
        String chatId = "session-123";
        Long mockUserId = 42L;

        when(authService.getAuthenticatedUserId()).thenReturn(mockUserId);

        Flux<String> mockStream = Flux.just("Artificial ", "Intelligence ", "is ", "cool.");

        when(ragChatService.askQuestionStream(question, chatId, mockUserId))
                .thenReturn(mockStream);

        String jsonPayload = """
                {
                    "question": "What is AI?",
                    "chatId": "session-123"
                }
                """;

        // Act & Assert (Part 1: Verify the async processing handles text event streams cleanly)
        MvcResult mvcResult = mockMvc.perform(post("/api/chat/ask/stream")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload)
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(request().asyncStarted())
                .andReturn();

        // Act & Assert (Part 2: Verify the dispatched reactive stream chunks)
        mockMvc.perform(asyncDispatch(mvcResult))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Artificial ")));
    }
}
