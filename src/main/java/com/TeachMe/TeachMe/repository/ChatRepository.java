package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Chat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findByUserId(Long userId);

    List<Chat> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Chat> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT c FROM Chat c WHERE c.user.id = :userId AND c.createdAt >= :cutoff ORDER BY c.createdAt DESC")
    List<Chat> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("cutoff") LocalDateTime cutoff);

    List<Chat> findBySessionId(String sessionId);

    List<Chat> findBySessionIdAndUserId(String sessionId, Long userId);

    List<Chat> findByDocumentId(Long documentId);

    List<Chat> findByDocumentIdAndUserId(Long documentId, Long userId);

    List<Chat> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    List<Chat> findByDocumentIdAndUserIdOrderByCreatedAtDesc(Long documentId, Long userId);

    Page<Chat> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Chat> findByDocumentIdOrderByCreatedAtDesc(Long documentId, Pageable pageable);

    Page<Chat> findByDocumentIdAndUserIdOrderByCreatedAtDesc(Long documentId, Long userId, Pageable pageable);

    Page<Chat> findBySessionIdOrderByCreatedAtDesc(String sessionId, Pageable pageable);

    Page<Chat> findBySessionIdAndUserIdOrderByCreatedAtDesc(String sessionId, Long userId, Pageable pageable);

    @Query("SELECT c FROM Chat c WHERE c.user.id = :userId AND (LOWER(c.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Chat> searchByUserIdAndTerm(@Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT c FROM Chat c WHERE c.document.id = :documentId AND (LOWER(c.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Chat> searchByDocumentIdAndTerm(@Param("documentId") Long documentId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT c FROM Chat c WHERE c.document.id = :documentId AND c.user.id = :userId AND (LOWER(c.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Chat> searchByDocumentIdAndUserIdAndTerm(@Param("documentId") Long documentId, @Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT c FROM Chat c WHERE c.sessionId = :sessionId AND (LOWER(c.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Chat> searchBySessionIdAndTerm(@Param("sessionId") String sessionId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT c FROM Chat c WHERE c.sessionId = :sessionId AND c.user.id = :userId AND (LOWER(c.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Chat> searchBySessionIdAndUserIdAndTerm(@Param("sessionId") String sessionId, @Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);
}