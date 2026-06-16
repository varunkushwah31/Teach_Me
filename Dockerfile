# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
# Copy the POM and source code
COPY pom.xml .
COPY src ./src
# Compile the application, skipping tests so the build is fast
RUN mvn clean package -DskipTests

# Stage 2: Create the production image
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
# Copy the compiled JAR from the build stage
COPY --from=build /app/target/TeachMe-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Tomcat server runs on
EXPOSE 8081

# Boot up the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]