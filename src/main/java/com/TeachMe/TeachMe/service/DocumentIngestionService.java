package com.TeachMe.TeachMe.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;

    public String ingestPdf(MultipartFile file) throws IOException {
        log.info("Starting ingestion for file: {}", file.getOriginalFilename());

        TikaDocumentReader reader = new TikaDocumentReader(new InputStreamResource(file.getInputStream()));
        List<Document> rawDocuments = reader.get();
        log.info("Extracted {} raw pages/sections from the PDF.", rawDocuments.size());

        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(100)
                .withMinChunkLengthToEmbed(5)
                .withMaxNumChunks(10000)
                .withKeepSeparator(true)
                .build();

        List<Document> splitDocuments = splitter.apply(rawDocuments);
        log.info("Split document into {} vectorized chunks. Saving to PostgreSQL...", splitDocuments.size());

        this.vectorStore.accept(splitDocuments);

        log.info("Successfully saved to database.");
        return "Successfully processed and embedded " + splitDocuments.size() + " text chunks into the database.";
    }
}