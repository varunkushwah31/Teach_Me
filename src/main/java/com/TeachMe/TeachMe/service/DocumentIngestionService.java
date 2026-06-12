package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.exception.FileProcessingException;
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

    // Custom Telemetry Counters
    private final Counter documentUploadCounter;
    private final Counter vectorChunkCounter;

    public DocumentIngestionService(VectorStore vectorStore,
                                    JobStatusManager jobStatusManager,
                                    MeterRegistry meterRegistry) {
        this.vectorStore = vectorStore;
        this.jobStatusManager = jobStatusManager;

        // Initialize the tracking metrics
        this.documentUploadCounter = Counter.builder("rag.documents.uploaded.total")
                .description("Total number of PDF documents ingested")
                .register(meterRegistry);

        this.vectorChunkCounter = Counter.builder("rag.vectors.generated.total")
                .description("Total number of vectorized text chunks saved to PostgreSQL")
                .register(meterRegistry);
    }

    @Async("taskExecutor")
    public void ingestPdfAsync(InputStream fileStream, String originalFilename, String category, String jobId) {
        try {
            log.info("Job {}: Starting background ingestion for {}", jobId, originalFilename);
            jobStatusManager.updateStatus(jobId, "PROCESSING");

            TikaDocumentReader reader = new TikaDocumentReader(new InputStreamResource(fileStream));
            List<Document> rawDocuments = reader.get();

            List<Document> enrichedDocuments = rawDocuments.stream()
                    .map(doc -> {
                        Map<String, Object> newMetadata = new HashMap<>(doc.getMetadata());
                        newMetadata.put("fileName", originalFilename);
                        newMetadata.put("category", category);
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

            // Update our custom business metrics
            documentUploadCounter.increment();
            vectorChunkCounter.increment(splitDocuments.size());

            log.info("Job {}: Successfully embedded {} chunks.", jobId, splitDocuments.size());
            jobStatusManager.updateStatus(jobId, "COMPLETED");

        } catch (Exception e) {
            log.error("Job {}: Failed to process document", jobId, e);
            jobStatusManager.updateStatus(jobId, "FAILED: " + e.getMessage());
            throw new FileProcessingException("Failed to parse and vectorize file: " + originalFilename, e);
        }
    }
}