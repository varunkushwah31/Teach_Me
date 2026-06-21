package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.Document;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentCleanupTask {

    private final DocumentRepository documentRepository;
    private final JdbcTemplate jdbcTemplate;

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
                int deletedVectors = jdbcTemplate.update(
                        "DELETE FROM vector_store WHERE metadata->>'dbDocumentId' = ?",
                        String.valueOf(doc.getId())
                );

                // 2. Delegate the physical file deletion to a clean helper method
                deletePhysicalFile(doc.getFilePath());

                // 3. Delete the SQL database record
                documentRepository.delete(doc);

                log.info("Purged Document ID {}: {} vector chunks removed.", doc.getId(), deletedVectors);
            } catch (DataAccessException e) {
                log.error("Failed to delete expired document ID {}", doc.getId(), e);
            }
        }

        log.info("Cleanup Task Finished. Purged {} expired documents.", expiredDocs.size());
    }

    private void deletePhysicalFile(String filePath) {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            try {
                Files.delete(path);
                log.info("Successfully deleted physical file: {}", filePath);
            } catch (IOException ioException) {
                log.warn("System could not delete physical file: {} - Reason: {}",
                        filePath, ioException.getMessage());
            }
        }
    }
}