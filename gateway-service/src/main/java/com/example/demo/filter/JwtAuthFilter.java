package com.example.demo.filter;

import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;  // lombok.Value 말고 이걸로!
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {
    private final SecretKey secretKey;

    //인증없이 통과할 경로들
    private static final List<String> WHITELIST = List.of(
            "/auth/signup",
            "/auth/login",
            "/auth/reissue",
            "/stocks"
    );

    //WHITELIST에 포함되더라도 인증이 필요한 경로들
    private static final List<String> PROTECTED_PATHS = List.of(
            "/stocks/wishlist"
    );

    public JwtAuthFilter(@Value("${jwt.secret}") String secret){
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain){
        String path = exchange.getRequest().getURI().getPath();

        //Whitelist 경로이고 보호 경로가 아니면 통과
        boolean isWhitelisted = WHITELIST.stream().anyMatch(path::startsWith);
        boolean isProtected = PROTECTED_PATHS.stream().anyMatch(path::startsWith);
        if (isWhitelisted && !isProtected) {
            return chain.filter(exchange);
        }

        // Authorization 헤더 확인
        String authorization = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        try {
            // JWT 검증
            String token = authorization.substring(7);
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // X-User-Id 헤더에 userId 추가
            Long userId = ((Number) claims.get("userId")).longValue();
            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(r -> r.header("X-User-Id", String.valueOf(userId)))
                    .build();

            return chain.filter(modifiedExchange);

        } catch (Exception e) {
            log.error("JWT 검증 실패: {}", e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
    @Override
    public int getOrder() {
        return -1; // 가장 먼저 실행
    }
}
