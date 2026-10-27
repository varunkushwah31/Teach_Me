package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.FlashcardReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface FlashcardReviewLogRepository extends JpaRepository<FlashcardReviewLog, Long> {

    List<FlashcardReviewLog> findByUserIdOrderByReviewedAtDesc(Long userId);

    List<FlashcardReviewLog> findByUserIdAndReviewedAtAfter(Long userId, LocalDateTime after);

    long countByUserId(Long userId);
}
