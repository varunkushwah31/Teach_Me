package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.exception.FileProcessingException;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.service.DocumentIngestionService;
import com.TeachMe.TeachMe.service.DocumentSummarizationService;
import com.TeachMe.TeachMe.service.JobStatusManager;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DocumentIngestionServiceImpl implements DocumentIngestionService {

    private final VectorStore vectorStore;
    private final JobStatusManager jobStatusManager;
    private final DocumentRepository documentRepository;
    private final DocumentSummarizationService summarizationService;
    private final Counter documentUploadCounter;
    private final Counter vectorChunkCounter;

    public DocumentIngestionServiceImpl(VectorStore vectorStore,
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

    @Override
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
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

    @Override
    @Async("taskExecutor")
    public void ingestPdfAsync(byte[] fileBytes, String originalFilename, Long fileSize,
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

            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return originalFilename;
                }
            };
            TikaDocumentReader reader = new TikaDocumentReader(resource);
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

            // Hierarchical Parent-Child Chunking Strategy
            List<org.springframework.ai.document.Document> parentChunks =
                    TokenTextSplitter.builder()
                            .withChunkSize(600)
                            .withMinChunkSizeChars(200)
                            .withMinChunkLengthToEmbed(5)
                            .withMaxNumChunks(10000)
                            .withKeepSeparator(true)
                            .build()
                            .apply(enrichedDocuments);

            List<org.springframework.ai.document.Document> childChunks = new java.util.ArrayList<>();
            TokenTextSplitter childSplitter = TokenTextSplitter.builder()
                    .withChunkSize(150)
                    .withMinChunkSizeChars(50)
                    .withMinChunkLengthToEmbed(5)
                    .withMaxNumChunks(10000)
                    .withKeepSeparator(true)
                    .build();

            for (org.springframework.ai.document.Document parent : parentChunks) {
                List<org.springframework.ai.document.Document> children = childSplitter.apply(List.of(parent));
                for (org.springframework.ai.document.Document child : children) {
                    Map<String, Object> childMeta = new HashMap<>(child.getMetadata());
                    childMeta.put("parentId", parent.getId());
                    childMeta.put("parentContent", parent.getText());
                    childChunks.add(org.springframework.ai.document.Document.builder()
                            .id(child.getId())
                            .text(child.getText())
                            .metadata(childMeta)
                            .build());
                }
            }

            vectorStore.accept(childChunks);

            documentUploadCounter.increment();
            vectorChunkCounter.increment(childChunks.size());

            log.info("Job {}: embedded {} child chunks from {} parent blocks",
                    jobId, childChunks.size(), parentChunks.size());

            jobStatusManager.updateStatus(jobId, "COMPLETED");

            dbDocument.setStatus(com.TeachMe.TeachMe.entity.Document.DocumentStatus.COMPLETED);
            documentRepository.save(dbDocument);

            if (childChunks.size() > 50) {
                log.info("Document {} has {} chunks — triggering auto-summarization",
                        dbDocument.getId(), childChunks.size());
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
