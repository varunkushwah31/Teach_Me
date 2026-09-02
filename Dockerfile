# Optimized Multi-Stage Dockerfile for TeachMe Backend (Spring Boot with Java 25) - Render Deployment
FROM eclipse-temurin:25-jdk-noble AS backend-builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first for dependency caching
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw && sed -i 's/\r$//' mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source and build package
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Final Runtime Image (Java 25 JRE)
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

# Install curl for Render health checks and create non-root user
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/sh appuser

# Copy built JAR from backend builder with correct ownership
COPY --chown=appuser:appgroup --from=backend-builder /app/target/*.jar app.jar

USER appuser

EXPOSE 8081

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]