package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByDocumentId(Long documentId);
    List<Quiz> findByUserId(Long userId);
    Page<Quiz> findByUserId(Long userId, Pageable pageable);
}

