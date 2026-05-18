package com.example.demo.controller;

import com.example.demo.security.jwt.CustomJwtException;
import com.example.demo.security.jwt.JwtUtil;
import com.example.demo.security.redis.RedisService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class ApiRefreshController {
    private final JwtUtil jwtUtil;
    private final RedisService redisService;

    @PostMapping("/reissue")
    public ResponseEntity<?> reissue(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            // 1. 쿠키에서 Refresh Token 꺼내기
            String refreshToken = getRefreshTokenFromCookie(request);
            if (refreshToken == null || refreshToken.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("error", "NULL_REFRESH"));
            }

            // 2. Access Token이 아직 유효하면 그대로 반환
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String accessToken = authorization.substring(7);
                if (!isExpired(accessToken)) {
                    return ResponseEntity.ok(Map.of("accessToken", accessToken));
                }
            }

            // 3. Refresh Token 검증
            Claims claims = jwtUtil.validateToken(refreshToken);
            Long userId = ((Number) claims.get("userId")).longValue();

            // 4. Redis에 저장된 토큰이랑 비교
            String savedToken = redisService.get(userId);
            if (savedToken == null || !savedToken.equals(refreshToken)) {
                return ResponseEntity.status(401).body(Map.of("error", "INVALID_REFRESH"));
            }

            // 5. 새 Access Token 발급
            Map<String, Object> newClaims = Map.of(
                    "userId", userId,
                    "email", claims.get("email")
            );
            String newAccessToken = jwtUtil.generateToken(newClaims, 30);

            // 6. Refresh Token 만료 1시간 미만이면 재발급
            if (isRefreshTokenExpiringSoon(claims)) {
                String newRefreshToken = jwtUtil.generateToken(newClaims, 120);
                redisService.save(userId, newRefreshToken, 120);

                Cookie cookie = new Cookie("refreshToken", newRefreshToken);
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                cookie.setMaxAge(60 * 60 * 2);
                response.addCookie(cookie);
            }

            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));

        } catch (CustomJwtException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    // 쿠키에서 Refresh Token 추출
    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // Access Token 만료 여부 확인
    private boolean isExpired(String token) {
        try {
            jwtUtil.validateToken(token);
            return false;
        } catch (CustomJwtException e) {
            return e.getMessage().equals("Expired");
        }
    }

    // Refresh Token 만료 1시간 미만인지 확인
    private boolean isRefreshTokenExpiringSoon(Claims claims) {
        Date exp = claims.getExpiration();
        long remaining = exp.getTime() - System.currentTimeMillis();
        return remaining < 60 * 60 * 1000; // 1시간 미만
    }
}
