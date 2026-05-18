package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
//로그인 응답
@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
}
