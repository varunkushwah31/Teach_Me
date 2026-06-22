package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.RagChatService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import reactor.core.publisher.Flux;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class RagChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RagChatService ragChatService;

    @MockitoBean
    private AuthService authService; // ✅ Correctly mock the extracted AuthService dependency

    @Test
    @WithMockUser(username = "test@teachme.com")
    void shouldStreamChatResponseSuccessfully() throws Exception {
        // Arrange
        String question = "What is AI?";
        String chatId = "session-123";
        Long mockUserId = 42L; // ✅ Uses numerical IDs instead of bulky objects

        // ✅ Tell the mocked auth identity service to return our numerical ID
        Mockito.when(authService.getAuthenticatedUserId()).thenReturn(mockUserId);

        // Mock the LLM reactive stream output
        Flux<String> mockStream = Flux.just("Artificial ", "Intelligence ", "is ", "cool.");

        // ✅ Clean Mockito stubbing: passed values directly without eq()
        Mockito.when(ragChatService.askQuestionStream(question, chatId, mockUserId))
                .thenReturn(mockStream);

        // ✅ Removed the unused "category" attribute to match our updated web contract
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