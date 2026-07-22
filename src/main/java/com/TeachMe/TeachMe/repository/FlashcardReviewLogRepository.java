package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.FlashcardReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlashcardReviewLogRepository extends JpaRepository<FlashcardReviewLog, Long> {

    List<FlashcardReviewLog> findByUserIdOrderByReviewedAtDesc(Long userId);

    List<FlashcardReviewLog> findByUserIdAndReviewedAtAfter(Long userId, LocalDateTime after);

    long countByUserId(Long userId);
}
