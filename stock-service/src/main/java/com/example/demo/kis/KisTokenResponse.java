package com.example.demo.kis;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

//KIS 토큰 발급 응답 DTO
@Getter
public class KisTokenResponse {
    @JsonProperty("access_token")
    private String accessToken;
    @JsonProperty("token_type")
    private String tokenType;
    @JsonProperty("expires_in")
    private Long expiresIn;
}
