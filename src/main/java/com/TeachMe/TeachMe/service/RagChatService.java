package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class RagChatService {

    private final ChatClient mainChatClient;
    private final ChatClient rewriteClient;
    private final ChatMemory chatMemory;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final HybridSearchService hybridSearchService;
    private final ReRankingService reRankingService;
    private final CitationService citationService;

    private static final String SYSTEM_INSTRUCTION_TEMPLATE = """
            You are an expert academic tutor. Answer the user's question using ONLY the provided context below.

            IMPORTANT: When citing information from the context, include citations in the format [1], [2], etc.,
            where the number refers to the numbered sources below.
            Example: "According to the documentation [1], the process works as follows..."

            If the answer cannot be found in the context, clearly state that you do not have enough information.

            Numbered Context Sources:
            """;

    public RagChatService(ChatClient.Builder chatClientBuilder,
                          ChatMemory chatMemory,
                          ChatRepository chatRepository,
                          UserRepository userRepository,
                          DocumentRepository documentRepository,
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
        this.documentRepository = documentRepository;
        this.hybridSearchService = hybridSearchService;
        this.reRankingService = reRankingService;
        this.citationService = citationService;
    }

    public Flux<String> askQuestionStream(String question, String chatId, Long userId) {
        return Mono.fromCallable(() -> userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found")))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(currentUser -> {
                    log.info("Session {}: question='{}' userId={}", chatId, question, userId);

                    String optimizedQuery = optimizeSearchQuery(question, chatId);
                    List<Document> similarDocuments = hybridSearchService.hybridSearch(optimizedQuery, currentUser.getId(), chatId, 8);
                    List<Document> reRankedDocuments = reRankingService.reRankChunks(optimizedQuery, similarDocuments, 4);

                    StringBuilder contextBuilder = new StringBuilder();
                    for (int i = 0; i < reRankedDocuments.size(); i++) {
                        Document doc = reRankedDocuments.get(i);
                        contextBuilder.append("[").append(i + 1).append("] ").append(doc.getText()).append("\n\n");
                    }

                    String context = contextBuilder.toString();
                    String systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE + context;
                    StringBuilder aiResponseBuffer = new StringBuilder();

                    // Extract the document ID from the metadata of the first retrieved chunk to associate the Chat session with the Document.
                    com.TeachMe.TeachMe.entity.Document documentAssoc = null;
                    if (!reRankedDocuments.isEmpty()) {
                        Object dbDocIdObj = reRankedDocuments.get(0).getMetadata().get("dbDocumentId");
                        if (dbDocIdObj != null) {
                            try {
                                Long docId = Long.valueOf(dbDocIdObj.toString());
                                documentAssoc = documentRepository.findById(docId).orElse(null);
                            } catch (Exception e) {
                                log.warn("Failed to parse dbDocumentId from chunk metadata", e);
                            }
                        }
                    }
                    final com.TeachMe.TeachMe.entity.Document finalDocAssoc = documentAssoc;

                    return mainChatClient.prompt()
                            .system(systemInstruction)
                            .user(question)
                            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))
                            .stream()
                            .content()
                            .doOnNext(aiResponseBuffer::append)
                            .publishOn(Schedulers.boundedElastic())
                            // ✅ Detach persistence: Trigger this only after the stream finishes
                            .doFinally(signalType -> {
                                if (signalType == reactor.core.publisher.SignalType.ON_COMPLETE) {
                                    try {
                                        Chat chatRecord = Chat.builder()
                                                .sessionId(chatId)
                                                .question(question)
                                                .answer(aiResponseBuffer.toString())
                                                .context(context)
                                                .user(currentUser)
                                                .document(finalDocAssoc)
                                                .build();
                                        Chat savedChat = chatRepository.save(chatRecord);
                                        citationService.extractAndSaveCitations(savedChat, aiResponseBuffer.toString(), reRankedDocuments);
                                        log.info("Successfully persisted chat session {}", chatId);
                                    } catch (Exception e) {
                                        log.error("Failed to persist chat record", e);
                                    }
                                }
                            });
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

        String userPrompt = "Conversation History:\n" + historyText
                + "\n\nNew Question: " + originalQuestion;

        try {
            String rewritten = rewriteClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();
            return cleanDeepSeekTags(rewritten, originalQuestion);
        } catch (Exception e) {
            log.warn("Query rewriting failed, using original", e);
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