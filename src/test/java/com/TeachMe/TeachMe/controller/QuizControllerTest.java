package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.dto.QuizQuestionDTO;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.QuizGenerationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.chat.model.ChatModel;

import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;

import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

@ActiveProfiles("test")
@WebMvcTest(QuizController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizGenerationService quizGenerationService;

    @MockitoBean
    private UserRepository userRepository;

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
    void shouldGenerateQuizSuccessfully() throws Exception {
        Long mockUserId = 10L;
        User user = User.builder().id(mockUserId).email("user@test.com").build();
        QuizDTO mockQuiz = QuizDTO.builder().id(1L).title("Test Quiz").totalQuestions(5).passScore(80).build();

        when(authService.getAuthenticatedUserId()).thenReturn(mockUserId);
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(user));
        when(quizGenerationService.generateQuiz(100L, user)).thenReturn(mockQuiz);

        mockMvc.perform(post("/api/quiz/generate/100"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Quiz"));
    }

    @Test
    void shouldSubmitAndGradeQuizSuccessfully() throws Exception {
        Long mockUserId = 10L;
        QuizQuestionDTO q1 = QuizQuestionDTO.builder()
                .id(1L)
                .questionText("Question 1")
                .correctAnswerIndex(0)
                .explanation("Correct 0")
                .options(List.of("A", "B", "C", "D"))
                .build();

        QuizDTO mockQuiz = QuizDTO.builder()
                .id(1L)
                .title("Test Quiz")
                .totalQuestions(1)
                .passScore(80)
                .questions(List.of(q1))
                .build();

        when(authService.getAuthenticatedUserId()).thenReturn(mockUserId);
        when(quizGenerationService.getQuiz(1L, mockUserId)).thenReturn(mockQuiz);

        String submitPayload = """
                {
                    "answers": [0]
                }
                """;

        mockMvc.perform(post("/api/quiz/submit/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(submitPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctAnswers").value(1))
                .andExpect(jsonPath("$.score").value(100.0))
                .andExpect(jsonPath("$.passed").value(true));
    }
}
