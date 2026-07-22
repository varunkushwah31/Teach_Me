package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.AiQuizResponse;
import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.dto.QuizQuestionDTO;
import com.TeachMe.TeachMe.entity.Quiz;
import com.TeachMe.TeachMe.entity.QuizQuestion;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.exception.FileProcessingException;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.repository.QuizRepository;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import io.micrometer.core.annotation.Timed;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
public class QuizGenerationService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final QuizRepository quizRepository;
    private final DocumentRepository documentRepository;

    public QuizGenerationService(ChatClient.Builder chatClientBuilder,
                                 VectorStore vectorStore,
                                 QuizRepository quizRepository,
                                 DocumentRepository documentRepository) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.quizRepository = quizRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional
    @Timed("rag.quiz.generate")
    public QuizDTO generateQuiz(Long documentId, User currentUser) {
        log.info("Generating quiz for document ID: {}", documentId);

        com.TeachMe.TeachMe.entity.Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new FileProcessingException("Document not found: " + documentId));

        if (!doc.getUser().getId().equals(currentUser.getId())) {
            throw new FileProcessingException("Access denied: You do not own this document.");
        }

        SearchRequest searchRequest = SearchRequest.builder()
                .topK(8)
                .filterExpression(
                        new FilterExpressionBuilder().eq("dbDocumentId", documentId).build())
                .build();

        List<Document> documentChunks = vectorStore.similaritySearch(searchRequest);
        log.info("Retrieved {} chunks for quiz generation (documentId={})",
                documentChunks.size(), documentId);

        String combinedContext = documentChunks.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        String systemPrompt = "You are an expert educational assessment designer. "
                + "Generate a 5-question multiple-choice quiz based strictly on "
                + "the provided document content.";

        // 1. Manually instantiate Spring AI's structured output converter
        BeanOutputConverter<AiQuizResponse> converter = new BeanOutputConverter<>(AiQuizResponse.class);

        // 2. Append the required JSON schema format instructions directly to the prompt
        String userPrompt = "@question_retrieval Create a quiz based on this document context:\n\n" + combinedContext
                + "\n\n" + converter.getFormat();

        try {
            // 3. Request RAW text (.content()) instead of an automated entity mapping (.entity())
            String rawResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            if (rawResponse == null || rawResponse.isBlank()) {
                throw new IllegalStateException("LLM returned an empty or invalid quiz response");
            }

            // 4. Surgically remove DeepSeek reasoning tags
            String cleanJson = cleanDeepSeekTags(rawResponse);

            // 5. Safely parse the pure JSON string
            AiQuizResponse aiResponse = converter.convert(cleanJson);

            Quiz quiz = createQuizFromAiResponse(aiResponse, doc, currentUser);
            Quiz savedQuiz = quizRepository.save(quiz);
            log.info("Quiz saved with ID: {}", savedQuiz.getId());
            return mapQuizToDTO(savedQuiz);

        } catch (Exception e) {
            log.error("Failed to generate quiz for document {}", documentId, e);
            throw new FileProcessingException("Quiz generation failed: " + e.getMessage(), e);
        }
    }

    private String cleanDeepSeekTags(String response) {
        if (response == null) return "";
        if (response.contains("</think>")) {
            response = response.substring(response.indexOf("</think>") + 8);
        }
        return response.trim();
    }

    private Quiz createQuizFromAiResponse(AiQuizResponse data,
                                          com.TeachMe.TeachMe.entity.Document doc,
                                          User currentUser) {
        Quiz quiz = Quiz.builder()
                .title(data.title())
                .description(data.description() != null ? data.description() : "")
                .document(doc)
                .user(currentUser)
                .passScore(80)
                .build();

        Set<QuizQuestion> questions = new HashSet<>();
        List<AiQuizResponse.QuestionItem> items = data.questions();

        for (int i = 0; i < items.size(); i++) {
            AiQuizResponse.QuestionItem item = items.get(i);
            questions.add(QuizQuestion.builder()
                    .questionText(item.questionText())
                    .questionOrder(i)
                    .options(item.options())
                    .correctAnswerIndex(item.correctAnswerIndex())
                    .explanation(item.explanation() != null ? item.explanation() : "")
                    .quiz(quiz)
                    .build());
        }

        quiz.setQuestions(questions);
        quiz.setTotalQuestions(questions.size());
        return quiz;
    }

    private QuizDTO mapQuizToDTO(Quiz quiz) {
        List<QuizQuestionDTO> questionDTOs = quiz.getQuestions().stream()
                .sorted(Comparator.comparingInt(QuizQuestion::getQuestionOrder))
                .map(q -> QuizQuestionDTO.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionOrder(q.getQuestionOrder())
                        .options(q.getOptions())
                        .correctAnswerIndex(q.getCorrectAnswerIndex())
                        .explanation(q.getExplanation())
                        .build())
                .toList();

        return QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .totalQuestions(quiz.getTotalQuestions())
                .passScore(quiz.getPassScore())
                .questions(questionDTOs)
                .documentId(quiz.getDocument().getId())
                .documentName(quiz.getDocument().getFileName())
                .build();
    }

    public QuizDTO getQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new FileProcessingException("Quiz not found: " + quizId));
        if (!quiz.getUser().getId().equals(userId)) {
            throw new FileProcessingException("Access denied: You do not own this quiz.");
        }
        return mapQuizToDTO(quiz);
    }

    public List<QuizDTO> getAllQuizzesForDocument(Long documentId, Long userId) {
        com.TeachMe.TeachMe.entity.Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new FileProcessingException("Document not found: " + documentId));
        if (!doc.getUser().getId().equals(userId)) {
            throw new FileProcessingException("Access denied: You do not own this document.");
        }
        return quizRepository.findByDocumentId(documentId).stream()
                .map(this::mapQuizToDTO)
                .toList();
    }

    public List<QuizDTO> getAllQuizzesForUser(Long userId) {
        return quizRepository.findByUserId(userId).stream()
                .map(this::mapQuizToDTO)
                .toList();
    }

    public Page<QuizDTO> getPaginatedQuizzesForUser(Long userId, Pageable pageable) {
        return quizRepository.findByUserId(userId, pageable).map(this::mapQuizToDTO);
    }
}