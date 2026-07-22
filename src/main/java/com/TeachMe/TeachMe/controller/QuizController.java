package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.dto.QuizFeedbackDTO;
import com.TeachMe.TeachMe.dto.QuizQuestionDTO;
import com.TeachMe.TeachMe.dto.QuizResponseDTO;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.QuizGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Endpoints for generating, taking, and submitting document-based learning quizzes.")
public class QuizController {

    public static final String ACCESS_DENIED = "Access denied";

    private final QuizGenerationService quizGenerationService;
    private final UserRepository userRepository;
    private final AuthService authService;

    @PostMapping("/generate/{documentId}")
    public ResponseEntity<QuizDTO> generateQuiz(@PathVariable Long documentId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            QuizDTO quiz = quizGenerationService.generateQuiz(documentId, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(quiz);

        } catch (Exception e) {
            log.error("Failed to generate quiz for document ID: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{quizId}")
    @Operation(summary = "Get quiz details", description = "Retrieves quiz details including questions and options, ensuring user ownership.")
    @ApiResponse(responseCode = "200", description = "Quiz retrieved successfully")
    @ApiResponse(responseCode = "403", description = ACCESS_DENIED + ": Quiz not owned by user")
    @ApiResponse(responseCode = "404", description = "Quiz not found")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable Long quizId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            QuizDTO quiz = quizGenerationService.getQuiz(quizId, userId);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            log.error("Failed to fetch quiz ID: {}", quizId, e);
            if (e.getMessage() != null && e.getMessage().contains(ACCESS_DENIED)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/submit/{quizId}")
    @Operation(summary = "Submit quiz answers", description = "Grades the submitted quiz answers and returns detailed score and feedback.")
    @ApiResponse(responseCode = "200", description = "Quiz graded successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request or answers list")
    @ApiResponse(responseCode = "403", description = ACCESS_DENIED + ": Quiz not owned by user")
    public ResponseEntity<QuizResponseDTO> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> response) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            // Secure by passing user context:
            QuizDTO quiz = quizGenerationService.getQuiz(quizId, userId);

            @SuppressWarnings("unchecked")
            List<Integer> userAnswers = (List<Integer>) response.get("answers");

            if (userAnswers == null) {
                log.warn("Missing 'answers' array in request body for quiz ID: {}", quizId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            List<QuizQuestionDTO> questions = quiz.getQuestions();
            List<QuizFeedbackDTO> feedback = new ArrayList<>();
            int correctCount = 0;

            for (int i = 0; i < userAnswers.size() && i < questions.size(); i++) {
                QuizQuestionDTO question = questions.get(i);
                Integer userAnswer = userAnswers.get(i);
                Integer correctAnswer = question.getCorrectAnswerIndex();

                boolean isCorrect = userAnswer != null && userAnswer.equals(correctAnswer);
                if (isCorrect) {
                    correctCount++;
                }

                feedback.add(QuizFeedbackDTO.builder()
                        .questionIndex(i)
                        .questionText(question.getQuestionText())
                        .userAnswer(userAnswer != null ? userAnswer : -1)
                        .correctAnswer(correctAnswer)
                        .isCorrect(isCorrect)
                        .explanation(question.getExplanation())
                        .build());
            }

            double score = quiz.getTotalQuestions() > 0
                    ? (double) correctCount / quiz.getTotalQuestions() * 100
                    : 0.0;
            boolean passed = score >= quiz.getPassScore();

            QuizResponseDTO result = QuizResponseDTO.builder()
                    .quizId(quizId)
                    .userAnswers(userAnswers)
                    .totalQuestions(quiz.getTotalQuestions())
                    .correctAnswers(correctCount)
                    .score(score)
                    .passed(passed)
                    .feedback(feedback)
                    .build();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Failed to submit and grade quiz ID: {}", quizId, e);
            if (e.getMessage() != null && e.getMessage().contains(ACCESS_DENIED)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get document quizzes", description = "Retrieves all quizzes generated for a specific document, validating user ownership.")
    @ApiResponse(responseCode = "200", description = "Quizzes retrieved successfully")
    @ApiResponse(responseCode = "403", description = ACCESS_DENIED + ": Document not owned by user")
    public ResponseEntity<List<QuizDTO>> getQuizzesForDocument(@PathVariable Long documentId) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(quizGenerationService.getAllQuizzesForDocument(documentId, userId));
        } catch (Exception e) {
            log.error("Failed to fetch quizzes for document ID: {}", documentId, e);
            if (e.getMessage() != null && e.getMessage().contains(ACCESS_DENIED)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-quizzes/export")
    @Operation(summary = "Export user quizzes", description = "Retrieves all quizzes generated by the authenticated user for export.")
    @ApiResponse(responseCode = "200", description = "Quizzes exported successfully")
    public ResponseEntity<List<QuizDTO>> exportMyQuizzes() {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(quizGenerationService.getAllQuizzesForUser(userId));
        } catch (Exception e) {
            log.error("Failed to export quizzes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-quizzes")
    @Operation(summary = "Get user quizzes", description = "Retrieves a paginated list of quizzes generated by the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Quizzes retrieved successfully")
    public ResponseEntity<Page<QuizDTO>> getMyQuizzesPaginated(Pageable pageable) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(quizGenerationService.getPaginatedQuizzesForUser(userId, pageable));
        } catch (Exception e) {
            log.error("Failed to fetch paginated quizzes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}