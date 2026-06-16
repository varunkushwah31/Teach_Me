package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.RagChatService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

@SpringBootTest
@AutoConfigureWebTestClient
class RagChatControllerTest {

    @Autowired
    private WebTestClient webTestClient;


    @MockitoBean
    private RagChatService ragChatService;

    @Test
    @WithMockUser(username = "admin@teachme.com")
    void shouldStreamChatResponseSuccessfully() {
        // Arrange
        String question = "What is quantum computing?";
        String chatId = "session-123";
        String category = "physics";

        Flux<String> mockResponseStream = Flux.just("Quantum ", "computing ", "uses ", "qubits.");

        Mockito.when(ragChatService.askQuestionStream(question, chatId, category))
                .thenReturn(mockResponseStream);

        // Act & Assert
        Flux<String> responseBody = webTestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/chat/ask/stream")
                        .queryParam("question", question)
                        .queryParam("chatId", chatId)
                        .queryParam("category", category)
                        .build())
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(String.class)
                .getResponseBody();

        // Use StepVerifier to validate async emissions element by element
        StepVerifier.create(responseBody)
                .expectNext("Quantum ")
                .expectNext("computing ")
                .expectNext("uses ")
                .expectNext("qubits.")
                .verifyComplete();
    }

    @Test
    void shouldReturn401UnauthorizedWhenTokenMissing() {
        webTestClient.get()
                .uri("/api/chat/ask/stream?question=test&chatId=1&category=all")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isUnauthorized();
    }
}