package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.DocumentSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DocumentSummaryRepository extends JpaRepository<DocumentSummary, Long> {
    Optional<DocumentSummary> findByDocumentId(Long documentId);
}

