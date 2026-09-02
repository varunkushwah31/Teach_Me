package com.TeachMe.TeachMe.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PgVectorHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public Health health() {
        try {
            Long count = fetchVectorStoreCount();
            boolean extensionExists = checkPgVectorExtension();

            return Health.up()
                    .withDetail("vectorStoreTable", "vector_store")
                    .withDetail("vectorCount", count != null ? count : 0)
                    .withDetail("pgvectorExtension", extensionExists ? "ENABLED" : "AUTO_INITIALIZE")
                    .withDetail("vectorDatabase", "PostgreSQL + pgvector")
                    .build();
        } catch (Exception e) {
            log.warn("Observability: Database connectivity health check failed", e);
            return Health.down(e)
                    .withDetail("error", "Database error: " + e.getMessage())
                    .build();
        }
    }

    private Long fetchVectorStoreCount() {
        try {
            return jdbcTemplate.queryForObject("SELECT count(*) FROM vector_store", Long.class);
        } catch (Exception _) {
            // Table may not be initialized yet before first document upload
            return null;
        }
    }

    private boolean checkPgVectorExtension() {
        try {
            Integer extCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM pg_extension WHERE extname = 'vector'", Integer.class);
            return extCount != null && extCount > 0;
        } catch (Exception _) {
            // Not a postgres DB or query not supported
            return false;
        }
    }
}
