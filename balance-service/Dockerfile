# ---- Build Stage ----
FROM gradle:8-jdk17-alpine AS builder

WORKDIR /app

# 의존성 캐싱 (소스 변경 시 재다운로드 방지)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true

COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ---- Run Stage ----
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 보안: root가 아닌 전용 유저로 실행
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
