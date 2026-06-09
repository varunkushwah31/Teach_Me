package com.TeachMe.TeachMe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RagChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    // We build the ChatClient using the injected builder
    public RagChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }

    public String askQuestion(String question) {
        log.info("Searching database for context related to: {}", question);

        // 1. Perform Semantic Search in PostgreSQL
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(4) // Retrieve the top 4 most relevant chunks
                        .build()
        );

        // 2. Stitch the retrieved chunks together into a single string
        String context = similarDocuments.stream()
                .map(Document::getFormattedContent)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.info("Found {} relevant chunks. Sending context to DeepSeek-R1...", similarDocuments.size());

        // 3. Construct the prompt and call the LLM
        String systemInstruction = """
                You are an expert academic tutor. Answer the user's question using ONLY the provided context below.
                If the answer cannot be found in the context, clearly state that you do not have enough information.
                
                Context:
                """ + context;

        return chatClient.prompt()
                .system(systemInstruction)
                .user(question)
                .call()
                .content();
    }
}