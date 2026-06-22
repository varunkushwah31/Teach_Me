package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Flashcard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    Page<Flashcard> findByUserId(Long userId, Pageable pageable);
    List<Flashcard> findByUserIdAndDeckName(Long userId, String deckName);
    Page<Flashcard> findByUserIdAndDeckName(Long userId, String deckName, Pageable pageable);

    // Spaced repetition queries
    @Query("SELECT f FROM Flashcard f WHERE f.user.id = :userId AND f.nextReviewDate <= :now ORDER BY f.nextReviewDate ASC")
    List<Flashcard> findDueForReview(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    List<Flashcard> findByDocumentId(Long documentId);
}

