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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;

import org.springframework.test.context.ActiveProfiles;

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;

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
}