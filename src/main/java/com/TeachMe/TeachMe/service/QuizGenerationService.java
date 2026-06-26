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
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
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

    public QuizDTO generateQuiz(Long documentId, User currentUser) {
        log.info("Generating quiz for document ID: {}", documentId);

        com.TeachMe.TeachMe.entity.Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new FileProcessingException("Document not found: " + documentId));

        // topK rose from 5 → 25, so quiz questions sample a representative slice
        // of the document rather than just the first five chunks. The combined
        // context string is then passed to the LLM, which already handles large inputs.
        SearchRequest searchRequest = SearchRequest.builder()
                .topK(25)
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

        String userPrompt = "Create a quiz using this document context:\n\n" + combinedContext;

        try {
            AiQuizResponse aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .entity(AiQuizResponse.class);

            if (aiResponse == null || aiResponse.questions() == null) {
                throw new IllegalStateException("LLM returned an empty or invalid quiz response");
            }

            Quiz quiz = createQuizFromAiResponse(aiResponse, doc, currentUser);
            Quiz savedQuiz = quizRepository.save(quiz);
            log.info("Quiz saved with ID: {}", savedQuiz.getId());
            return mapQuizToDTO(savedQuiz);

        } catch (Exception e) {
            log.error("Failed to generate quiz for document {}", documentId, e);
            throw new FileProcessingException("Quiz generation failed: " + e.getMessage(), e);
        }
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

    public QuizDTO getQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new FileProcessingException("Quiz not found: " + quizId));
        return mapQuizToDTO(quiz);
    }

    public List<QuizDTO> getAllQuizzesForDocument(Long documentId) {
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