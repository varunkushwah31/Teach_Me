package com.TeachMe.TeachMe.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldAcceptPdfUploadSuccessfully() throws Exception {
        // Create a fake PDF file in memory
        MockMultipartFile fakePdf = new MockMultipartFile(
                "file",
                "syllabus.pdf",
                "application/pdf",
                "Dummy PDF Content".getBytes()
        );

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(fakePdf)
                        .param("category", "computer-science"))
                .andExpect(status().is2xxSuccessful());
    }
}