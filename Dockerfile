# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

# 1. Copy ONLY the pom.xml first
COPY pom.xml .

# 2. Download all dependencies (Docker will cache this massive layer!)
RUN mvn dependency:go-offline

# 3. NOW copy your source code
COPY src ./src


# 4. Compile the application using the cached dependencies
RUN mvn clean package -DskipTests

# Stage 2: Create the production image
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -g 1000 -S appgroup && adduser -u 1000 -S appuser -G appgroup
COPY --from=build /app/target/TeachMe-0.0.1-SNAPSHOT.jar app.jar
USER appuser
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]