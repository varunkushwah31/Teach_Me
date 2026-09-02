package com.TeachMe.TeachMe.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Production Database Configuration supporting Render and standard PostgreSQL deployments.
 * Automatically normalizes Render connection strings (e.g. postgres:// or postgresql://)
 * into JDBC-compliant URLs (jdbc:postgresql://...).
 */
@Slf4j
@Configuration
public class DatabaseConfig {

    private static final String POSTGRES_PREFIX = "postgres://";
    private static final String POSTGRESQL_PREFIX = "postgresql://";
    private static final String JDBC_POSTGRESQL_PREFIX = "jdbc:postgresql://";

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5433/vectordb}")
    private String rawDatasourceUrl;

    @Value("${spring.datasource.username:springai}")
    private String configuredUsername;

    @Value("${spring.datasource.password:secret}")
    private String configuredPassword;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minIdle;

    private record DbCredentials(String jdbcUrl, String username, String password) {}

    @Bean
    @Primary
    public DataSource dataSource() {
        String envDatabaseUrl = System.getenv("DATABASE_URL");
        String urlToUse = (envDatabaseUrl != null && !envDatabaseUrl.isBlank()) ? envDatabaseUrl : rawDatasourceUrl;

        DbCredentials creds = resolveCredentials(urlToUse, configuredUsername, configuredPassword);

        // Check for H2 in test profile
        if (creds.jdbcUrl() != null && creds.jdbcUrl().startsWith("jdbc:h2:")) {
            HikariConfig h2Config = new HikariConfig();
            h2Config.setJdbcUrl(creds.jdbcUrl());
            h2Config.setUsername(creds.username());
            h2Config.setPassword(creds.password());
            h2Config.setDriverClassName("org.h2.Driver");
            return new HikariDataSource(h2Config);
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(creds.jdbcUrl());
        config.setUsername(creds.username());
        config.setPassword(creds.password());
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setLeakDetectionThreshold(5000);

        log.info("Initialized HikariDataSource with JDBC URL: {}", creds.jdbcUrl());
        return new HikariDataSource(config);
    }

    private DbCredentials resolveCredentials(String rawUrl, String defaultUsername, String defaultPassword) {
        if (rawUrl == null || (!rawUrl.startsWith(POSTGRES_PREFIX) && !rawUrl.startsWith(POSTGRESQL_PREFIX))) {
            return new DbCredentials(rawUrl, defaultUsername, defaultPassword);
        }

        try {
            URI uri = new URI(rawUrl);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath(); // includes leading '/'
            
            String username = defaultUsername;
            String password = defaultPassword;
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                password = parts[1];
            }

            String jdbcUrl = JDBC_POSTGRESQL_PREFIX + host + ":" + port + path;
            log.info("Render PostgreSQL URI successfully converted to JDBC URL: {}{}:{}{}", JDBC_POSTGRESQL_PREFIX, host, port, path);
            return new DbCredentials(jdbcUrl, username, password);
        } catch (Exception e) {
            log.warn("Could not parse PostgreSQL URI ({}), falling back to direct string replacement", e.getMessage());
            String fallbackUrl = rawUrl.startsWith(POSTGRES_PREFIX)
                    ? JDBC_POSTGRESQL_PREFIX + rawUrl.substring(POSTGRES_PREFIX.length())
                    : JDBC_POSTGRESQL_PREFIX + rawUrl.substring(POSTGRESQL_PREFIX.length());
            return new DbCredentials(fallbackUrl, defaultUsername, defaultPassword);
        }
    }
}
