package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.dto.QuizDTO;
import com.TeachMe.TeachMe.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface QuizGenerationService {
    QuizDTO generateQuiz(Long documentId, User currentUser);
    QuizDTO getQuiz(Long quizId, Long userId);
    List<QuizDTO> getAllQuizzesForDocument(Long documentId, Long userId);
    List<QuizDTO> getAllQuizzesForUser(Long userId);
    Page<QuizDTO> getPaginatedQuizzesForUser(Long userId, Pageable pageable);
}