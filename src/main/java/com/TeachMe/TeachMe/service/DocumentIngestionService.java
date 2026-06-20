package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.exception.FileProcessingException;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final JobStatusManager jobStatusManager;
    private final DocumentRepository documentRepository;

    private final Counter documentUploadCounter;
    private final Counter vectorChunkCounter;

    public DocumentIngestionService(VectorStore vectorStore,
                                    JobStatusManager jobStatusManager,
                                    DocumentRepository documentRepository,
                                    MeterRegistry meterRegistry) {
        this.vectorStore = vectorStore;
        this.jobStatusManager = jobStatusManager;
        this.documentRepository = documentRepository;

        this.documentUploadCounter = Counter.builder("rag.documents.uploaded.total")
                .description("Total number of PDF documents ingested")
                .register(meterRegistry);

        this.vectorChunkCounter = Counter.builder("rag.vectors.generated.total")
                .description("Total number of vectorized text chunks saved to PostgreSQL")
                .register(meterRegistry);
    }

    @Async("taskExecutor")
    public void ingestPdfAsync(InputStream fileStream, String originalFilename, Long fileSize,
                               String category, String chatId, String jobId, User currentUser) {

        // 1. Create the Database Record immediately
        com.TeachMe.TeachMe.entity.Document dbDocument = com.TeachMe.TeachMe.entity.Document.builder()
                .fileName(originalFilename)
                .filePath("local-stream")
                .fileType("application/pdf")
                .fileSize(fileSize)
                .status(com.TeachMe.TeachMe.entity.Document.DocumentStatus.PROCESSING)
                .user(currentUser)
                .build();

        documentRepository.save(dbDocument);

        try {
            log.info("Job {}: Starting background ingestion for {}", jobId, originalFilename);
            jobStatusManager.updateStatus(jobId, "PROCESSING");

            TikaDocumentReader reader = new TikaDocumentReader(new InputStreamResource(fileStream));
            List<Document> rawDocuments = reader.get();

            // ✅ Cleaned up metadata mapping - stamps the vector with chatId and userId directly
            List<Document> enrichedDocuments = rawDocuments.stream()
                    .map(doc -> {
                        Map<String, Object> newMetadata = new HashMap<>(doc.getMetadata());
                        newMetadata.put("fileName", originalFilename);
                        newMetadata.put("category", category);
                        newMetadata.put("dbDocumentId", dbDocument.getId());
                        newMetadata.put("chatId", chatId);
                        newMetadata.put("userId", currentUser.getId());

                        return Document.builder()
                                .id(doc.getId())
                                .text(doc.getText())
                                .metadata(newMetadata)
                                .build();
                    })
                    .toList();

            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withChunkSize(800)
                    .withMinChunkSizeChars(100)
                    .withMinChunkLengthToEmbed(5)
                    .withMaxNumChunks(10000)
                    .withKeepSeparator(true)
                    .build();

            List<Document> splitDocuments = splitter.apply(enrichedDocuments);

            this.vectorStore.accept(splitDocuments);

            documentUploadCounter.increment();
            vectorChunkCounter.increment(splitDocuments.size());

            log.info("Job {}: Successfully embedded {} chunks.", jobId, splitDocuments.size());
            jobStatusManager.updateStatus(jobId, "COMPLETED");

            dbDocument.setStatus(com.TeachMe.TeachMe.entity.Document.DocumentStatus.COMPLETED);
            documentRepository.save(dbDocument);

        } catch (Exception e) {
            log.error("Job {}: Failed to process document", jobId, e);
            jobStatusManager.updateStatus(jobId, "FAILED: " + e.getMessage());

            dbDocument.setStatus(com.TeachMe.TeachMe.entity.Document.DocumentStatus.FAILED);
            dbDocument.setErrorMessage(e.getMessage());
            documentRepository.save(dbDocument);

            throw new FileProcessingException("Failed to parse and vectorize file: " + originalFilename, e);
        }
    }
}