package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);
    List<Document> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Document> findByUserIdAndStatus(Long userId, Document.DocumentStatus status);

    // Pagination support
    Page<Document> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Document> findByUserIdAndStatus(Long userId, Document.DocumentStatus status, Pageable pageable);

    // Search with pagination
    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND (LOWER(d.fileName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) ORDER BY d.createdAt DESC")
    Page<Document> searchByUserIdAndTerm(@Param("userId") Long userId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.status = :status AND (LOWER(d.fileName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) ORDER BY d.createdAt DESC")
    Page<Document> searchByUserIdStatusAndTerm(@Param("userId") Long userId, @Param("status") Document.DocumentStatus status, @Param("searchTerm") String searchTerm, Pageable pageable);
    List<Document> findByCreatedAtBefore(java.time.LocalDateTime date);
}
