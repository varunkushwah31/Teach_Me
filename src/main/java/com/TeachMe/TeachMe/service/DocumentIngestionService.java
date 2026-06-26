package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.exception.FileProcessingException;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.InputStreamResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Handles async PDF ingestion into pgvector and heals any documents left
 * stuck in PROCESSING status from a previous server run.
 */
@Slf4j
@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final JobStatusManager jobStatusManager;
    private final DocumentRepository documentRepository;
    private final DocumentSummarizationService summarizationService;
    private final Counter documentUploadCounter;
    private final Counter vectorChunkCounter;

    public DocumentIngestionService(VectorStore vectorStore,
                                    JobStatusManager jobStatusManager,
                                    DocumentRepository documentRepository,
                                    DocumentSummarizationService summarizationService,
                                    MeterRegistry meterRegistry) {
        this.vectorStore = vectorStore;
        this.jobStatusManager = jobStatusManager;
        this.documentRepository = documentRepository;
        this.summarizationService = summarizationService;
        this.documentUploadCounter = Counter.builder("rag.documents.uploaded.total")
                .description("Total number of PDF documents ingested")
                .register(meterRegistry);
        this.vectorChunkCounter = Counter.builder("rag.vectors.generated.total")
                .description("Total number of vectorized text chunks saved to PostgreSQL")
                .register(meterRegistry);
    }

    /**
     * On startup, any document left in PROCESSING status from a previous run
     * (e.g., a mid-ingestion server crash) is transitioned to FAILED, so the UI
     * shows an actionable error instead of a permanently spinning indicator.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void healStuckDocuments() {
        List<com.TeachMe.TeachMe.entity.Document> stuck =
                documentRepository.findByStatus(
                        com.TeachMe.TeachMe.entity.Document.DocumentStatus.PROCESSING);
        if (stuck.isEmpty()) return;

        log.warn("Found {} document(s) stuck in PROCESSING — marking FAILED", stuck.size());
        for (com.TeachMe.TeachMe.entity.Document doc : stuck) {
            doc.setStatus(com.TeachMe.TeachMe.entity.Document.DocumentStatus.FAILED);
            doc.setErrorMessage("Processing interrupted by a server restart.");
            documentRepository.save(doc);
            log.warn("Document {} ('{}') healed: PROCESSING → FAILED",
                    doc.getId(), doc.getFileName());
        }
    }

    @Async("taskExecutor")
    public void ingestPdfAsync(InputStream fileStream, String originalFilename, Long fileSize,
                               String category, String chatId, String jobId, User currentUser) {

        com.TeachMe.TeachMe.entity.Document dbDocument =
                com.TeachMe.TeachMe.entity.Document.builder()
                        .fileName(originalFilename)
                        .filePath("local-stream")
                        .fileType("application/pdf")
                        .fileSize(fileSize)
                        .status(com.TeachMe.TeachMe.entity.Document.DocumentStatus.PROCESSING)
                        .user(currentUser)
                        .build();
        documentRepository.save(dbDocument);

        try {
            log.info("Job {}: starting ingestion for '{}'", jobId, originalFilename);
            jobStatusManager.updateStatus(jobId, "PROCESSING");

            TikaDocumentReader reader = new TikaDocumentReader(new InputStreamResource(fileStream));
            List<org.springframework.ai.document.Document> rawDocuments = reader.get();

            List<org.springframework.ai.document.Document> enrichedDocuments = rawDocuments.stream()
                    .map(doc -> {
                        Map<String, Object> meta = new HashMap<>(doc.getMetadata());
                        meta.put("fileName", originalFilename);
                        meta.put("category", category);
                        meta.put("dbDocumentId", dbDocument.getId());
                        meta.put("chatId", chatId);
                        meta.put("userId", currentUser.getId());
                        return org.springframework.ai.document.Document.builder()
                                .id(doc.getId())
                                .text(doc.getText())
                                .metadata(meta)
                                .build();
                    })
                    .toList();

            List<org.springframework.ai.document.Document> splitDocuments =
                    TokenTextSplitter.builder()
                            .withChunkSize(800)
                            .withMinChunkSizeChars(100)
                            .withMinChunkLengthToEmbed(5)
                            .withMaxNumChunks(10000)
                            .withKeepSeparator(true)
                            .build()
                            .apply(enrichedDocuments);

            vectorStore.accept(splitDocuments);

            documentUploadCounter.increment();
            vectorChunkCounter.increment(splitDocuments.size());

            log.info("Job {}: embedded {} chunks", jobId, splitDocuments.size());
            jobStatusManager.updateStatus(jobId, "COMPLETED");

            dbDocument.setStatus(com.TeachMe.TeachMe.entity.Document.DocumentStatus.COMPLETED);
            documentRepository.save(dbDocument);

            if (splitDocuments.size() > 50) {
                log.info("Document {} has {} chunks — triggering auto-summarization",
                        dbDocument.getId(), splitDocuments.size());
                summarizationService.generateSummaryAsync(dbDocument.getId());
            }

        } catch (Exception e) {
            log.error("Job {}: failed to process '{}'", jobId, originalFilename, e);
            jobStatusManager.updateStatus(jobId, "FAILED: " + e.getMessage());
            dbDocument.setStatus(com.TeachMe.TeachMe.entity.Document.DocumentStatus.FAILED);
            dbDocument.setErrorMessage(e.getMessage());
            documentRepository.save(dbDocument);
            throw new FileProcessingException(
                    "Failed to parse and vectorize: " + originalFilename, e);
        }
    }
}