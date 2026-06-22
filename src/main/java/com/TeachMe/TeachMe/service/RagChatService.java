package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.dto.CitationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RagChatService {

    private final ChatClient mainChatClient;
    private final ChatClient rewriteClient;
    private final ChatMemory chatMemory;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository; // ✅ Added to conform to SOLID principles
    private final HybridSearchService hybridSearchService;
    private final ReRankingService reRankingService;
    private final CitationService citationService;

    private static final String SYSTEM_INSTRUCTION_TEMPLATE = """
            You are an expert academic tutor. Answer the user's question using ONLY the provided context below.
            
            IMPORTANT: When citing information from the context, include citations in the format [1], [2], etc., where the number refers to the numbered sources below.
            Example: "According to the documentation [1], the process works as follows..."
            
            If the answer cannot be found in the context, clearly state that you do not have enough information.
            
            Numbered Context Sources:
            """;

    public RagChatService(ChatClient.Builder chatClientBuilder,
                          ChatMemory chatMemory,
                          ChatRepository chatRepository,
                          UserRepository userRepository, // ✅ Injected dependency centrally
                          HybridSearchService hybridSearchService,
                          ReRankingService reRankingService,
                          CitationService citationService) {
        this.mainChatClient = chatClientBuilder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
        this.rewriteClient = chatClientBuilder.build();
        this.chatMemory = chatMemory;
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.hybridSearchService = hybridSearchService;
        this.reRankingService = reRankingService;
        this.citationService = citationService;
    }

    /**
     * Handles the full reactive stream pipeline including blocking user identity resolution
     */
    public Flux<String> askQuestionStream(String question, String chatId, Long userId) {
        // ✅ 1. Wrap the blocking JPA call safely on an elastic thread pool
        return Mono.fromCallable(() -> userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found")))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(currentUser -> {

                    log.info("Session {}: Received Original Question: '{}' for user ID: {}", chatId, question, userId);

                    String optimizedQuery = optimizeSearchQuery(question, chatId);
                    log.info("Session {}: Optimized Database Query: '{}'", chatId, optimizedQuery);

                    // 2. HYBRID SEARCH: Combine vector search and full-text search
                    List<Document> similarDocuments = hybridSearchService.hybridSearch(
                            optimizedQuery,
                            currentUser.getId(),
                            chatId,
                            8 // Retrieve more documents for re-ranking
                    );
                    log.info("Hybrid search returned {} documents", similarDocuments.size());

                    // 3. RE-RANKING: Score chunks for relevance before sending to LLM
                    List<Document> reRankedDocuments = reRankingService.reRankChunks(
                            optimizedQuery,
                            similarDocuments,
                            4 // Keep top 4 after re-ranking
                    );
                    log.info("Re-ranking reduced to {} documents", reRankedDocuments.size());

                    // 4. Build context with numbered citations
                    StringBuilder contextBuilder = new StringBuilder();
                    List<String> sourceChunks = new ArrayList<>();

                    for (int i = 0; i < reRankedDocuments.size(); i++) {
                        Document doc = reRankedDocuments.get(i);
                        contextBuilder.append("[").append(i + 1).append("] ");
                        contextBuilder.append(doc.getText());
                        contextBuilder.append("\n\n");
                        sourceChunks.add(doc.getText());
                    }

                    String context = contextBuilder.toString();
                    log.info("Found {} relevant chunks matching this chat session.", reRankedDocuments.size());

                    String systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE + context;

                    StringBuilder aiResponseBuffer = new StringBuilder();

                    // 5. Build and execute stream composition
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

                                Chat savedChat = chatRepository.save(chatRecord);

                                // Extract and save citations dynamically
                                try {
                                    List<CitationDTO> citations = citationService.extractAndSaveCitations(
                                            savedChat,
                                            aiResponseBuffer.toString(),
                                            sourceChunks
                                    );
                                    log.info("Session {}: Extracted {} citations", chatId, citations.size());
                                } catch (Exception e) {
                                    log.warn("Failed to extract citations", e);
                                }

                                log.info("Session {}: Chat history securely saved to PostgreSQL.", chatId);
                            }).subscribeOn(Schedulers.boundedElastic()).subscribe());
                });
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