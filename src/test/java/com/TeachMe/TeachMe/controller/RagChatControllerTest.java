package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
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

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    private UserRepository userRepository; // ✅ 1. We must mock the database lookup

    @Test
    @WithMockUser(username = "test@teachme.com") // ✅ 2. Safely simulates a logged-in user for the SecurityContext
    void shouldStreamChatResponseSuccessfully() throws Exception {
        // Arrange
        String question = "What is AI?";
        String chatId = "session-123";
        String category = "tech";

        // ✅ 3. Create a dummy user and tell the mocked repository to return it
        User mockUser = new User();
        mockUser.setEmail("test@teachme.com");

        Mockito.when(userRepository.findByEmail("test@teachme.com"))
                .thenReturn(Optional.of(mockUser));

        // ✅ 4. Mock the LLM stream, passing all 4 expected arguments
        Flux<String> mockStream = Flux.just("Artificial ", "Intelligence ", "is ", "cool.");

        Mockito.when(ragChatService.askQuestionStream(eq(question), eq(chatId), eq(category), any(User.class)))
                .thenReturn(mockStream);

        // Create the JSON payload that your controller expects
        String jsonPayload = """
                {
                    "question": "What is AI?",
                    "chatId": "session-123",
                    "category": "tech"
                }
                """;

        // Act & Assert (Part 1: Verify the async stream opens)
        MvcResult mvcResult = mockMvc.perform(post("/api/chat/ask/stream")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload)
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(request().asyncStarted())
                .andReturn();

        // Act & Assert (Part 2: Verify the dispatched stream contents)
        mockMvc.perform(asyncDispatch(mvcResult))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("data:Artificial")));
    }
}