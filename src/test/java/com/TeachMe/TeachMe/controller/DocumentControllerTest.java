package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.DocumentIngestionService;
import com.TeachMe.TeachMe.service.JobStatusManager;
import com.TeachMe.TeachMe.service.QuizGenerationService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import com.TeachMe.TeachMe.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.junit.jupiter.api.BeforeEach;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import java.time.Duration;
import static org.mockito.ArgumentMatchers.anyString;

@ActiveProfiles("test")
@WebMvcTest(DocumentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @MockitoBean
    private VectorStore vectorStore;

    @MockitoBean
    private ChatModel chatModel;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentIngestionService ingestionService;

    @MockitoBean
    private QuizGenerationService quizGenerationService;

    @MockitoBean
    private JobStatusManager jobStatusManager;

    @MockitoBean
    private UserRepository userRepository;

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
    void shouldAcceptPdfUploadSuccessfully() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));

        MockMultipartFile fakePdf = new MockMultipartFile(
                "file",
                "syllabus.pdf",
                "application/pdf",
                "Dummy PDF Content".getBytes()
        );

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(fakePdf)
                        .param("chatId", "session-123")
                        .param("category", "computer-science"))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void shouldDeleteDocumentSuccessfully() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        doNothing().when(ingestionService).deleteDocument(eq(101L), any(User.class));

        mockMvc.perform(delete("/api/documents/101"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturn404WhenDocumentNotFoundForDeletion() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        doThrow(new ResourceNotFoundException("Document not found with ID: 999"))
                .when(ingestionService).deleteDocument(eq(999L), any(User.class));

        mockMvc.perform(delete("/api/documents/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturn403WhenUserDoesNotOwnDocumentForDeletion() throws Exception {
        when(authService.getAuthenticatedUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        doThrow(new AccessDeniedException("Access denied"))
                .when(ingestionService).deleteDocument(eq(102L), any(User.class));

        mockMvc.perform(delete("/api/documents/102"))
                .andExpect(status().isForbidden());
    }
}