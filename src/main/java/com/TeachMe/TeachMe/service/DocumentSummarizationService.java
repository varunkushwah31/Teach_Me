package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.DocumentSummaryDTO;
import com.TeachMe.TeachMe.entity.DocumentSummary;
import com.TeachMe.TeachMe.repository.DocumentSummaryRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import io.micrometer.core.annotation.Timed;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DocumentSummarizationService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final DocumentSummaryRepository documentSummaryRepository;
    private final DocumentRepository documentRepository;

    public DocumentSummarizationService(ChatClient.Builder chatClientBuilder,
                                        VectorStore vectorStore,
                                        DocumentSummaryRepository documentSummaryRepository,
                                        DocumentRepository documentRepository) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.documentSummaryRepository = documentSummaryRepository;
        this.documentRepository = documentRepository;
    }

    @CacheEvict(value = "documentSummaries", key = "#documentId")
    @Async("taskExecutor")
    @Timed("rag.summary.generate")
    public void generateSummaryAsync(Long documentId) {
        log.info("Starting async summary generation for document ID: {}", documentId);

        com.TeachMe.TeachMe.entity.Document dbDocument = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        //  UPSERT PATTERN: Find the existing summary row or create a new one if it doesn't exist.
        DocumentSummary summary = documentSummaryRepository.findByDocumentId(documentId)
                .orElse(DocumentSummary.builder().document(dbDocument).build());

        // Now safely update the status to PROCESSING
        summary.setStatus(DocumentSummary.SummaryStatus.PROCESSING);
        documentSummaryRepository.save(summary);

        try {
            // MAP PHASE: Retrieve and chunk the document
            List<Document> documentChunks = retrieveDocumentChunks(documentId);
            log.info("Retrieved {} chunks for summarization", documentChunks.size());

            // Map phase: Summarize each chunk
            List<String> chunkSummaries = mapPhase(documentChunks);
            log.info("Map phase complete: {} summaries generated", chunkSummaries.size());

            // Reduce phase: Combine chunk summaries into executive summary
            String executiveSummary = reducePhase(chunkSummaries);
            log.info("Reduce phase complete");

            // Update summary record
            int wordCount = (executiveSummary != null) ? executiveSummary.split("\\s+").length : 0;
            int length = (executiveSummary != null) ? executiveSummary.length() : 0;

            summary.setExecutiveSummary(executiveSummary);
            summary.setStatus(DocumentSummary.SummaryStatus.COMPLETED);
            summary.setWordCount(wordCount);
            summary.setSummaryLength(length);
            documentSummaryRepository.save(summary);

            log.info("Summary generation completed for document: {}", documentId);

        } catch (Exception e) {
            log.error("Failed to generate summary for document {}", documentId, e);
            summary.setStatus(DocumentSummary.SummaryStatus.FAILED);
            summary.setErrorMessage(e.getMessage());
            documentSummaryRepository.save(summary);
        }
    }

    private List<Document> retrieveDocumentChunks(Long documentId) {
        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .topK(50);

        FilterExpressionBuilder b = new FilterExpressionBuilder();
        var filter = b.eq("dbDocumentId", documentId);
        requestBuilder.filterExpression(filter.build());

        return vectorStore.similaritySearch(requestBuilder.build());
    }

    private List<String> mapPhase(List<Document> chunks) {
        String mapPrompt = """
                Summarize the following document chunk in 2-3 sentences, focusing on key points and facts:
                
                Chunk:
                """;

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<String>> futures = chunks.stream()
                    .map(chunk -> CompletableFuture.supplyAsync(() -> {
                        try {
                            String summary = chatClient.prompt()
                                    .user(mapPrompt + chunk.getText())
                                    .call()
                                    .content();
                            return summary != null ? summary.strip() : "";
                        } catch (Exception e) {
                            log.warn("Error summarizing chunk", e);
                            String text = chunk.getText();
                            String fallback;
                            if (text != null && text.length() > 200) {
                                fallback = text.substring(0, 200);
                            } else fallback = Objects.requireNonNullElse(text, "");
                            return fallback;
                        }
                    }, executor))
                    .toList();

            return futures.stream()
                    .map(f -> f.join())
                    .toList();
        }
    }

    //  Removed unused parameter
    private String reducePhase(List<String> summaries) {
        String combinedSummaries = String.join("\n\n", summaries);

        String reducePrompt = """
                You are an expert technical writer. Create a concise 1-page executive summary (approximately 250-400 words) by combining the following chunk summaries.
                
                Guidelines:
                - Focus on the most important information
                - Maintain logical flow and readability
                - Eliminate redundancy
                - Use clear, professional language
                - Start with a brief overview of the document's purpose
                
                Chunk Summaries:
                """ + combinedSummaries;

        try {
            return chatClient.prompt()
                    .user(reducePrompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error in reduce phase", e);
            return summaries.stream()
                    .limit(10)
                    .collect(Collectors.joining("\n\n"));
        }
    }

    @Cacheable(value = "documentSummaries", key = "#documentId", unless = "#result == null || #result.status != 'COMPLETED'")
    public DocumentSummaryDTO getSummary(Long documentId) {
        DocumentSummary summary = documentSummaryRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new RuntimeException("Summary not found for document"));
        return mapToDTO(summary);
    }

    private DocumentSummaryDTO mapToDTO(DocumentSummary summary) {
        return DocumentSummaryDTO.builder()
                .id(summary.getId())
                .documentId(summary.getDocument().getId())
                .documentName(summary.getDocument().getFileName())
                .executiveSummary(summary.getExecutiveSummary())
                .summaryLength(summary.getSummaryLength())
                .wordCount(summary.getWordCount())
                .status(summary.getStatus().toString())
                .errorMessage(summary.getErrorMessage())
                .createdAt(summary.getCreatedAt())
                .build();
    }
}