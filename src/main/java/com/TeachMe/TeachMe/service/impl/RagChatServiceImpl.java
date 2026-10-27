package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.dto.ai.AiProviderConfigDTO;
import com.TeachMe.TeachMe.entity.Chat;
import com.TeachMe.TeachMe.repository.ChatRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.*;
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
import io.micrometer.core.annotation.Timed;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class RagChatServiceImpl implements RagChatService {

    private final ChatClient mainChatClient;
    private final ChatClient rewriteClient;
    private final ChatMemory chatMemory;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final HybridSearchService hybridSearchService;
    private final ReRankingService reRankingService;
    private final CitationService citationService;
    private final ExternalAiService externalAiService;

    private static final String SYSTEM_INSTRUCTION_TEMPLATE = """
            You are an expert academic tutor. Answer the user's question using ONLY the provided context below.

            IMPORTANT: When citing information from the context, include citations in the format [1], [2], etc.,
            where the number refers to the numbered sources below.
            Example: "According to the documentation [1], the process works as follows..."

            If the answer cannot be found in the context, clearly state that you do not have enough information.

            Numbered Context Sources:
            """;

    public RagChatServiceImpl(ChatClient.Builder chatClientBuilder,
                              ChatMemory chatMemory,
                              ChatRepository chatRepository,
                              UserRepository userRepository,
                              DocumentRepository documentRepository,
                              HybridSearchService hybridSearchService,
                              ReRankingService reRankingService,
                              CitationService citationService,
                              ExternalAiService externalAiService) {
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
        this.externalAiService = externalAiService;
    }

    @Override
    @Timed("rag.chat.ask")
    public Flux<String> askQuestionStream(String question, String chatId, Long userId) {
        return askQuestionStream(question, chatId, userId, List.of(), null);
    }

    @Override
    @Timed("rag.chat.ask.filtered")
    public Flux<String> askQuestionStream(String question, String chatId, Long userId, List<Long> documentIds) {
        return askQuestionStream(question, chatId, userId, documentIds, null);
    }

    @Override
    @Timed("rag.chat.ask.external")
    public Flux<String> askQuestionStream(String question, String chatId, Long userId, List<Long> documentIds, AiProviderConfigDTO aiConfig) {
        return Mono.fromCallable(() -> userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found")))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(currentUser -> {
                    AiProviderConfigDTO effectiveConfig = externalAiService.resolveConfig(aiConfig);
                    boolean useExternal = effectiveConfig.isExternal() || effectiveConfig.hasCustomKey() || externalAiService.isExternalConfigured();

                    log.info("Session {}: question='{}' userId={} docFilterCount={} provider={} model={}",
                            chatId, question, userId, documentIds != null ? documentIds.size() : 0,
                            effectiveConfig.resolvedProvider(), effectiveConfig.model());

                    String optimizedQuery = optimizeSearchQuery(question, chatId);
                    List<Document> similarDocuments = hybridSearchService.hybridSearch(optimizedQuery, currentUser.getId(), chatId, documentIds, 8);
                    List<Document> reRankedDocuments = reRankingService.reRankChunks(optimizedQuery, similarDocuments, 4);

                    String context = buildContextText(reRankedDocuments);
                    String systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE + context;
                    StringBuilder aiResponseBuffer = new StringBuilder();

                    com.TeachMe.TeachMe.entity.Document documentAssoc = extractDocumentAssociation(reRankedDocuments);

                    Flux<String> tokenFlux;
                    if (useExternal) {
                        tokenFlux = externalAiService.streamChat(systemInstruction, question, effectiveConfig);
                    } else {
                        tokenFlux = mainChatClient.prompt()
                                .system(systemInstruction)
                                .user(question)
                                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))
                                .stream()
                                .content();
                    }

                    return tokenFlux
                            .doOnNext(aiResponseBuffer::append)
                            .publishOn(Schedulers.boundedElastic())
                            .doFinally(signalType -> {
                                if (signalType == reactor.core.publisher.SignalType.ON_COMPLETE) {
                                    try {
                                        Chat chatRecord = Chat.builder()
                                                .sessionId(chatId)
                                                .question(question)
                                                .answer(aiResponseBuffer.toString())
                                                .context(context)
                                                .user(currentUser)
                                                .document(documentAssoc)
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

    private String buildContextText(List<Document> documents) {
        StringBuilder contextBuilder = new StringBuilder();
        for (int i = 0; i < documents.size(); i++) {
            Document doc = documents.get(i);
            String docName = doc.getMetadata().getOrDefault("documentName", "Unknown Document").toString();
            String page = doc.getMetadata().getOrDefault("page", "1").toString();
            contextBuilder.append(String.format("[%d] (Source: %s, Page: %s)\n%s\n\n",
                    i + 1, docName, page, doc.getText()));
        }
        return contextBuilder.toString();
    }

    private com.TeachMe.TeachMe.entity.Document extractDocumentAssociation(List<Document> documents) {
        for (Document doc : documents) {
            Object docIdObj = doc.getMetadata().get("documentId");
            if (docIdObj != null) {
                try {
                    Long docId = Long.valueOf(docIdObj.toString());
                    return documentRepository.findById(docId).orElse(null);
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    private String optimizeSearchQuery(String originalQuery, String chatId) {
        List<Message> history = chatMemory.get(chatId);
        if (history == null || history.isEmpty()) {
            return originalQuery;
        }

        String conversationContext = history.stream()
                .map(msg -> msg.getMessageType() + ": " + msg.getText())
                .collect(Collectors.joining("\n"));

        String rewritePrompt = """
                Given the following conversation history and a follow-up question, rewrite the follow-up question
                to be a standalone query that captures the full academic context.
                Do not answer the question, only rewrite it.
                Return only the rewritten query without any explanation.

                History:
                %s

                Follow-up Question: %s
                Rewritten Query:
                """.formatted(conversationContext, originalQuery);

        try {
            String rewritten = rewriteClient.prompt()
                    .user(rewritePrompt)
                    .call()
                    .content();
            log.debug("Rewritten query for session {}: '{}'", chatId, rewritten);
            return (rewritten != null && !rewritten.trim().isEmpty()) ? rewritten.trim() : originalQuery;
        } catch (Exception e) {
            log.warn("Query rewrite failed, falling back to original query: {}", e.getMessage());
            return originalQuery;
        }
    }
}
