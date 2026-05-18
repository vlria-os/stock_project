package com.example.demo.controller;

import com.example.demo.security.jwt.JwtUtil;
import com.example.demo.security.redis.RedisService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class LogoutController {
    private final RedisService redisService;
    private final JwtUtil jwtUtil;

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("Authorization") String authoriztaion,
            HttpServletResponse response){
        // Access Token에서 userId 꺼내기
        String token = authoriztaion.replace("Bearer","");
        Claims claims = jwtUtil.validateToken(token);
        Long userId = ((Number)claims.get("userId")).longValue();

        //Redis에서 Refresh Token 삭제
        redisService.delete(userId);

        // 쿠키 만료시켜서 삭제
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); //즉시 만료
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message","로그아웃 성공"));
    }
}
