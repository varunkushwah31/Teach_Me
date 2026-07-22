package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.HybridSearchService;
import com.TeachMe.TeachMe.service.ReRankingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;

import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

@ActiveProfiles("test")
@WebMvcTest(SearchController.class)
@AutoConfigureMockMvc(addFilters = false)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HybridSearchService hybridSearchService;

    @MockitoBean
    private ReRankingService reRankingService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private VectorStore vectorStore;

    @MockitoBean
    private ChatModel chatModel;

    @MockitoBean
    private com.TeachMe.TeachMe.security.RateLimitingService rateLimitingService;

    @MockitoBean
    private com.TeachMe.TeachMe.security.JwtService jwtService;

    @MockitoBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Test
    void shouldPerformBatchSearchAndReRank() throws Exception {
        Long mockUserId = 1L;
        String chatId = "session-abc";
        String q1 = "Machine Learning";

        Document doc = new Document("doc-1", "Machine Learning is a field of CS.", Map.of());

        when(authService.getAuthenticatedUserId()).thenReturn(mockUserId);
        when(hybridSearchService.hybridSearch(q1, mockUserId, chatId, 8))
                .thenReturn(List.of(doc));

        Map<String, List<Document>> searchResults = Map.of(q1, List.of(doc));
        when(reRankingService.processMultipleQueries(searchResults))
                .thenReturn(searchResults);

        String jsonBody = """
                [
                    "Machine Learning"
                ]
                """;

        mockMvc.perform(post("/api/search/batch/session-abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$['Machine Learning'][0]").value("Machine Learning is a field of CS."));
    }
}
