package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.RagChatService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
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

    @Test
    void shouldStreamChatResponseSuccessfully() throws Exception {
        // Arrange
        String question = "What is AI?";
        String chatId = "session-123";
        String category = "tech";

        // Mock the LLM returning a stream of words
        Flux<String> mockStream = Flux.just("Artificial ", "Intelligence ", "is ", "cool.");
        Mockito.when(ragChatService.askQuestionStream(question, chatId, category))
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