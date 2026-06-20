package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);
    List<Document> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Document> findByUserIdAndStatus(Long userId, Document.DocumentStatus status);
}
