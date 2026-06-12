package com.TeachMe.TeachMe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RagChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    public RagChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore, ChatMemory chatMemory) {
        this.chatClient = chatClientBuilder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();

        this.vectorStore = vectorStore;
    }

    public Flux<String> askQuestionStream(String question, String chatId, String category) {
        log.info("Session {}: Searching database for context related to: {} (Category: {})", chatId, question, category);

        // 1. Initialize the base Search Request
        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .query(question)
                .topK(4);

        // 2. Conditionally apply the metadata filter
        if (category != null && !category.equalsIgnoreCase("all")) {
            requestBuilder.filterExpression(
                    new FilterExpressionBuilder().eq("category", category).build()
            );
        }

        // 3. Execute Semantic Search in PostgreSQL
        List<Document> similarDocuments = vectorStore.similaritySearch(requestBuilder.build());

        // 4. Stitch the retrieved chunks together
        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.info("Found {} relevant chunks. Generating streaming response...", similarDocuments.size());

        // 5. Construct the System Prompt
        String systemInstruction = """
                You are an expert academic tutor. Answer the user's question using ONLY the provided context below.
                If the answer cannot be found in the context, clearly state that you do not have enough information.
                
                Context:
                """ + context;

        // 6. Call the LLM and return the reactive Flux stream
        return chatClient.prompt()
                .system(systemInstruction)
                .user(question)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))
                .stream()
                .content();
    }
}