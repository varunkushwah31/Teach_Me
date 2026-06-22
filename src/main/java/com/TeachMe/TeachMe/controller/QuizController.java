package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.dto.QuizResponseDTO;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.QuizGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

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
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable Long quizId) {
        try {
            QuizDTO quiz = quizGenerationService.getQuiz(quizId);
            return ResponseEntity.ok(quiz);

        } catch (Exception e) {
            log.error("Failed to fetch quiz ID: {}", quizId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/submit/{quizId}")
    public ResponseEntity<QuizResponseDTO> submitQuiz(@PathVariable Long quizId,
                                                      @RequestBody Map<String, Object> response) {
        try {
            QuizDTO quiz = quizGenerationService.getQuiz(quizId);

            @SuppressWarnings("unchecked")
            List<Integer> userAnswers = (List<Integer>) response.get("answers");

            // Defensive check against missing JSON payloads
            if (userAnswers == null) {
                log.warn("Missing 'answers' array in request body for quiz ID: {}", quizId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            int correctCount = 0;
            for (int i = 0; i < userAnswers.size() && i < quiz.getQuestions().size(); i++) {
                Integer userAnswer = userAnswers.get(i);
                Integer correctAnswer = quiz.getQuestions().get(i).getCorrectAnswerIndex();

                // Safe equality check preventing NPE if an individual answer is null
                if (userAnswer != null && userAnswer.equals(correctAnswer)) {
                    correctCount++;
                }
            }

            double score = (double) correctCount / quiz.getTotalQuestions() * 100;
            boolean passed = score >= quiz.getPassScore();

            QuizResponseDTO result = QuizResponseDTO.builder()
                    .quizId(quizId)
                    .userAnswers(userAnswers)
                    .totalQuestions(quiz.getTotalQuestions())
                    .correctAnswers(correctCount)
                    .score(score)
                    .passed(passed)
                    .build();

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Failed to submit and grade quiz ID: {}", quizId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<QuizDTO>> getQuizzesForDocument(@PathVariable Long documentId) {
        try {
            return ResponseEntity.ok(quizGenerationService.getAllQuizzesForDocument(documentId));
        } catch (Exception e) {
            log.error("Failed to fetch quizzes for document ID: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-quizzes/export")
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
    public ResponseEntity<org.springframework.data.domain.Page<QuizDTO>> getMyQuizzesPaginated(org.springframework.data.domain.Pageable pageable) {
        try {
            Long userId = authService.getAuthenticatedUserId();
            return ResponseEntity.ok(quizGenerationService.getPaginatedQuizzesForUser(userId, pageable));
        } catch (Exception e) {
            log.error("Failed to fetch paginated quizzes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}