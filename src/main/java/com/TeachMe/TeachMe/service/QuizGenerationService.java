package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.AiQuizResponse;
import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.dto.QuizQuestionDTO;
import com.TeachMe.TeachMe.entity.Quiz;
import com.TeachMe.TeachMe.entity.QuizQuestion;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.exception.FileProcessingException;
import com.TeachMe.TeachMe.repository.QuizRepository;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
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
        log.info("Starting structured quiz generation for document ID: {}", documentId);

        com.TeachMe.TeachMe.entity.Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new FileProcessingException("Document not found"));

        SearchRequest searchRequest = SearchRequest.builder()
                .topK(5)
                .filterExpression(new FilterExpressionBuilder().eq("dbDocumentId", documentId).build())
                .build();

        List<Document> documentChunks = vectorStore.similaritySearch(searchRequest);

        String combinedContext = documentChunks.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        log.info("Retrieved {} chunks for quiz context generation", documentChunks.size());

        String systemPrompt = "You are an expert educational assessment designer. " +
                "Generate a 5-question multiple-choice quiz based strictly on the provided document content.";

        String userPrompt = "Create a quiz using this document context:\n\n" + combinedContext;

        try {
            // ✅ Spring AI automatically handles JSON parsing and Markdown stripping via .entity()
            AiQuizResponse aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .entity(AiQuizResponse.class);

            if (aiResponse == null || aiResponse.questions() == null) {
                throw new IllegalStateException("LLM returned an empty response or invalid schema");
            }

            Quiz quiz = createQuizFromAiResponse(aiResponse, doc, currentUser);
            Quiz savedQuiz = quizRepository.save(quiz);

            log.info("Quiz generated and saved successfully with ID: {}", savedQuiz.getId());
            return mapQuizToDTO(savedQuiz);

        } catch (Exception e) {
            log.error("Failed to generate quiz", e);
            // ✅ Using specific custom exception
            throw new FileProcessingException("Quiz generation failed: " + e.getMessage(), e);
        }
    }

    private Quiz createQuizFromAiResponse(AiQuizResponse data, com.TeachMe.TeachMe.entity.Document doc, User currentUser) {
        Quiz quiz = Quiz.builder()
                .title(data.title())
                .description(data.description() != null ? data.description() : "")
                .document(doc)
                .user(currentUser)
                .passScore(80)
                .build();

        Set<QuizQuestion> questions = new HashSet<>();
        List<AiQuizResponse.QuestionItem> questionItems = data.questions();

        for (int i = 0; i < questionItems.size(); i++) {
            AiQuizResponse.QuestionItem item = questionItems.get(i);

            QuizQuestion question = QuizQuestion.builder()
                    .questionText(item.questionText())
                    .questionOrder(i)
                    .options(item.options())
                    .correctAnswerIndex(item.correctAnswerIndex())
                    .explanation(item.explanation() != null ? item.explanation() : "")
                    .quiz(quiz)
                    .build();

            questions.add(question);
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
                .toList(); // ✅ Modern Java 16+ .toList()

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
                .orElseThrow(() -> new FileProcessingException("Quiz not found"));
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

    public org.springframework.data.domain.Page<QuizDTO> getPaginatedQuizzesForUser(Long userId, org.springframework.data.domain.Pageable pageable) {
        return quizRepository.findByUserId(userId, pageable)
                .map(this::mapQuizToDTO);
    }
}