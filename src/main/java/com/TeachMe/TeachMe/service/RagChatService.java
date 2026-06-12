package com.TeachMe.TeachMe.service;

import io.micrometer.core.annotation.Timed;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.Message;
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

    private final ChatClient mainChatClient;
    private final ChatClient rewriteClient;
    private final VectorStore vectorStore;
    private final ChatMemory chatMemory;

    public RagChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore, ChatMemory chatMemory) {
        this.mainChatClient = chatClientBuilder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();

        this.rewriteClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.chatMemory = chatMemory;
    }

    @Timed(value = "rag.chat.execution.time", description = "Time taken to process a question and start the stream")
    public Flux<String> askQuestionStream(String question, String chatId, String category) {
        log.info("Session {}: Received Original Question: '{}'", chatId, question);

        // --- STEP 1: QUERY REWRITING ---
        String optimizedQuery = optimizeSearchQuery(question, chatId);
        log.info("Session {}: Optimized Database Query: '{}'", chatId, optimizedQuery);

        // --- STEP 2: SEMANTIC SEARCH ---
        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(4);

        if (category != null && !category.equalsIgnoreCase("all")) {
            requestBuilder.filterExpression(
                    new FilterExpressionBuilder().eq("category", category).build()
            );
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(requestBuilder.build());

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.info("Found {} relevant chunks. Generating streaming response...", similarDocuments.size());

        // --- STEP 3: GENERATE FINAL ANSWER ---
        String systemInstruction = """
                You are an expert academic tutor. Answer the user's question using ONLY the provided context below.
                If the answer cannot be found in the context, clearly state that you do not have enough information.
                
                Context:
                """ + context;

        return mainChatClient.prompt()
                .system(systemInstruction)
                .user(question)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))
                .stream()
                .content();
    }

    private String optimizeSearchQuery(String originalQuestion, String chatId) {
        // Fixed: get() now only takes the conversation ID
        List<Message> history = chatMemory.get(chatId);

        // Fixed: Removed redundant null check
        if (history.isEmpty()) {
            return originalQuestion;
        }

        // Format the last 5 messages into a flat string for the LLM to read
        String historyText = history.stream()
                .skip(Math.max(0, history.size() - 5)) // Ensures we only grab the tail end of long conversations
                .map(m -> m.getMessageType().name() + ": " + m.getText()) // 🚨 Fixed: Use getText()
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are an expert search query rewriter.
                Analyze the Conversation History and the New Question.
                If the New Question contains pronouns (he, it, that, those) or vague references, rewrite it into a single, standalone, highly specific search query.
                If the New Question is already specific and standalone, return it exactly as is.
                
                RULES:
                1. Output ONLY the raw rewritten query.
                2. Do NOT add quotes, formatting, xml tags, or conversational text.
                """;

        String userPrompt = "Conversation History:\n" + historyText + "\n\nNew Question: " + originalQuestion;

        try {
            String rewritten = rewriteClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            return cleanDeepSeekTags(rewritten, originalQuestion);

        } catch (Exception e) {
            log.warn("Query rewriting failed, falling back to original query", e);
            return originalQuestion;
        }
    }

    private String cleanDeepSeekTags(String response, String fallback) {
        if (response == null || response.isBlank()) {
            return fallback;
        }

        if (response.contains("</think>")) {
            response = response.substring(response.indexOf("</think>") + 8);
        }

        return response.trim();
    }
}