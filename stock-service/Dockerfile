FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src
RUN find src -name "*.java" | grep -i kafka || echo "=== KAFKA FILES NOT FOUND IN DOCKER CONTEXT ==="
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test
RUN jar tf build/libs/*.jar | grep -i "UserEvent" || echo "=== UserEvent NOT IN JAR ==="

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
