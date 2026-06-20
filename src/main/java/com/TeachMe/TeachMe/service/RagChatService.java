package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.ChatRepository;
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
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RagChatService {

    private final ChatClient mainChatClient;
    private final ChatClient rewriteClient;
    private final VectorStore vectorStore;
    private final ChatMemory chatMemory;
    private final ChatRepository chatRepository;

    public RagChatService(ChatClient.Builder chatClientBuilder,
                          VectorStore vectorStore,
                          ChatMemory chatMemory,
                          ChatRepository chatRepository) {
        this.mainChatClient = chatClientBuilder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
        this.rewriteClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.chatMemory = chatMemory;
        this.chatRepository = chatRepository;
    }

    public Flux<String> askQuestionStream(String question, String chatId, String category, User currentUser) {
        log.info("Session {}: Received Original Question: '{}'", chatId, question);

        String optimizedQuery = optimizeSearchQuery(question, chatId);
        log.info("Session {}: Optimized Database Query: '{}'", chatId, optimizedQuery);

        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(4);

        // ✅ Strict Multi-Tenant Isolation Filter Built Cleanly Inside Method
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        var filter = b.and(
                b.eq("userId", currentUser.getId()),
                b.eq("chatId", chatId)
        );
        requestBuilder.filterExpression(filter.build());

        if (category != null && !category.equalsIgnoreCase("all")) {
            filter = b.and(filter, b.eq("category", category));
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(requestBuilder.build());

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.info("Found {} relevant chunks matching this chat session.", similarDocuments.size());

        String systemInstruction = """
                You are an expert academic tutor. Answer the user's question using ONLY the provided context below.
                If the answer cannot be found in the context, clearly state that you do not have enough information.
                
                Context:
                """ + context;

        StringBuilder aiResponseBuffer = new StringBuilder();

        return mainChatClient.prompt()
                .system(systemInstruction)
                .user(question)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))
                .stream()
                .content()
                .doOnNext(aiResponseBuffer::append)
                .doOnComplete(() -> Mono.fromRunnable(() -> {
                    Chat chatRecord = Chat.builder()
                            .sessionId(chatId)
                            .question(question)
                            .answer(aiResponseBuffer.toString())
                            .context(context)
                            .user(currentUser)
                            .build();

                    chatRepository.save(chatRecord);
                    log.info("Session {}: Chat history securely saved to PostgreSQL.", chatId);
                }).subscribeOn(Schedulers.boundedElastic()).subscribe());
    }

    private String optimizeSearchQuery(String originalQuestion, String chatId) {
        List<Message> history = chatMemory.get(chatId);

        if (history.isEmpty()) {
            return originalQuestion;
        }

        String historyText = history.stream()
                .skip(Math.max(0, history.size() - 5))
                .map(m -> m.getMessageType().name() + ": " + m.getText())
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are an expert search query rewriter.
                Analyze the Conversation History and the New Question.
                If the New Question contains pronouns, rewrite it into a single, standalone search query.
                If the New Question is already specific, return it exactly as is.
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
            log.warn("Query rewriting failed", e);
            return originalQuestion;
        }
    }

    private String cleanDeepSeekTags(String response, String fallback) {
        if (response == null || response.isBlank()) return fallback;
        if (response.contains("</think>")) {
            response = response.substring(response.indexOf("</think>") + 8);
        }
        return response.trim();
    }
}