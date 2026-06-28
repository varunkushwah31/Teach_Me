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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
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

    @Async("taskExecutor")
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

        return chunks.parallelStream()
                .map(chunk -> {
                    try {
                        String summary = chatClient.prompt()
                                .user(mapPrompt + chunk.getText())
                                .call()
                                .content();
                        // Safe null check before stripping
                        return summary != null ? summary.strip() : "";
                    } catch (Exception e) {
                        log.warn("Error summarizing chunk", e);
                        // Safe null check before substring
                        String text = chunk.getText();
                        return (text != null && text.length() > 200)
                                ? text.substring(0, 200)
                                : (text != null ? text : "");
                    }
                })
                .toList(); // Using modern Java 16+ .toList()
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