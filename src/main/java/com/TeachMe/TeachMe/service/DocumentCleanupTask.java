package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentCleanupTask {

    private final DocumentRepository documentRepository;
    private final JdbcTemplate jdbcTemplate; // Allows us to write native SQL to pgvector

    // Runs every day at 3:00 AM server time
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpiredDocuments() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        log.info("Starting automated cleanup of documents older than 30 days (Before: {})", cutoffDate);

        List<Document> expiredDocs = documentRepository.findByCreatedAtBefore(cutoffDate);

        if (expiredDocs.isEmpty()) {
            log.info("No expired documents found. Cleanup complete.");
            return;
        }

        for (Document doc : expiredDocs) {
            try {
                // 1. Wipe the mathematical vectors from the pgvector table
                // We target the exact dbDocumentId we stamped into the metadata earlier
                int deletedVectors = jdbcTemplate.update(
                        "DELETE FROM vector_store WHERE metadata->>'dbDocumentId' = ?",
                        String.valueOf(doc.getId())
                );

                // 2. Delete the physical file from your local disk
                java.io.File file = new java.io.File(doc.getFilePath());
                if (file.exists()) {
                    boolean isDeleted = file.delete();
                    if (!isDeleted) {
                        log.warn("Failed to delete physical file from disk: {}", doc.getFilePath());
                    }
                }

                // 3. Delete the SQL record (and unlink it from any chats)
                documentRepository.delete(doc);

                log.info("Purged Document ID {}: {} vector chunks removed.", doc.getId(), deletedVectors);
            } catch (Exception e) {
                log.error("Failed to delete expired document ID {}", doc.getId(), e);
            }
        }

        log.info("Cleanup Task Finished. Purged {} expired documents.", expiredDocs.size());
    }
}