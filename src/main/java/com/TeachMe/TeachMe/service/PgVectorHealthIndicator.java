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
            Long count = jdbcTemplate.queryForObject("SELECT count(*) FROM vector_store", Long.class);
            return Health.up()
                    .withDetail("vectorStoreTable", "vector_store")
                    .withDetail("vectorCount", count != null ? count : 0)
                    .withDetail("vectorDatabase", "PostgreSQL + pgvector")
                    .build();
        } catch (Exception e) {
            log.warn("Observability: PgVector table health check failed", e);
            return Health.down(e)
                    .withDetail("error", "Failed to query vector_store table: " + e.getMessage())
                    .build();
        }
    }
}
