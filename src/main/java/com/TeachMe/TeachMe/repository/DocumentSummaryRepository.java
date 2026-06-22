package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.DocumentSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentSummaryRepository extends JpaRepository<DocumentSummary, Long> {
    Optional<DocumentSummary> findByDocumentId(Long documentId);
}

