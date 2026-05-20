package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.SignUpRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    //회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody @Valid SignUpRequest request){
        userService.signUp(request);
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request, HttpServletResponse response){
        LoginResponse result = userService.login(request);

        Cookie refreshCookie = new Cookie("refreshToken", result.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60*60*2); //2시간
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of("accessToken", result.getAccessToken()));
    }

    //내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @RequestHeader("X-User-Id") Long userId){
        return ResponseEntity.ok(userService.getMe(userId));
    }

    //회원탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<?> withdraw(
            @RequestHeader("X-User-Id") Long userId){
        userService.withdraw(userId);
        return ResponseEntity.ok(Map.of("message","회원탈퇴 성공"));
    }

}
