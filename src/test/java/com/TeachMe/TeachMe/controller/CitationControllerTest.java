package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.CitationDTO;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.CitationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;

import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

@ActiveProfiles("test")
@WebMvcTest(CitationController.class)
@AutoConfigureMockMvc(addFilters = false)
class CitationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CitationService citationService;

    @MockitoBean
    private ChatRepository chatRepository;

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
    void shouldReturnCitationsWhenOwnedByUser() throws Exception {
        Long userId = 5L;
        Long chatId = 20L;
        User user = User.builder().id(userId).build();
        Chat chat = Chat.builder().id(chatId).user(user).build();

        CitationDTO citation = CitationDTO.builder()
                .id(1L)
                .citationIndex(1)
                .documentName("test.pdf")
                .pageNumber(3)
                .quote("Direct quote text")
                .build();

        when(authService.getAuthenticatedUserId()).thenReturn(userId);
        when(chatRepository.findById(chatId)).thenReturn(Optional.of(chat));
        when(citationService.getCitationsForChat(chatId)).thenReturn(List.of(citation));

        mockMvc.perform(get("/api/citations/chat/20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].citationIndex").value(1))
                .andExpect(jsonPath("$[0].documentName").value("test.pdf"))
                .andExpect(jsonPath("$[0].quote").value("Direct quote text"));
    }

    @Test
    void shouldReturn403WhenChatNotOwnedByUser() throws Exception {
        Long userId = 5L;
        Long otherUserId = 99L;
        Long chatId = 20L;
        User otherUser = User.builder().id(otherUserId).build();
        Chat chat = Chat.builder().id(chatId).user(otherUser).build();

        when(authService.getAuthenticatedUserId()).thenReturn(userId);
        when(chatRepository.findById(chatId)).thenReturn(Optional.of(chat));

        mockMvc.perform(get("/api/citations/chat/20"))
                .andExpect(status().isForbidden());
    }
}
