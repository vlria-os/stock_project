package com.example.demo.kis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KisTokenService {
    private final WebClient kisWebClient;
    @Value("${kis.app-key}")
    private String appKey;
    @Value("${kis.app-secret}")
    private String appSecret;

    //메모리에 토큰캐싱
    private String cachedToken;
    private LocalDateTime tokenExpiredAt;

    public String getAccessToken(){
        //토큰이 있고 만료 10분 전이면 캐시된 토큰 반환
        if (cachedToken != null && tokenExpiredAt != null
        && LocalDateTime.now().isBefore(tokenExpiredAt.minusMinutes(10))){
            return cachedToken;
        }
        return reissueToken();
    }
    private String reissueToken(){
        log.info("KIS Access Token 발급 요청");

        Map<String, String> requestBody = Map.of(
                "grant_type", "client_credentials",
                "appkey",appKey,
                "appsecret",appSecret
        );

        KisTokenResponse response = kisWebClient.post()
                .uri("/oauth2/tokenP")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(KisTokenResponse.class)
                .block();

        if(response == null || response.getAccessToken() == null){
            throw new RuntimeException("KIS AccessToken 발급 실패");
        }
        cachedToken = response.getAccessToken();
        tokenExpiredAt = LocalDateTime.now().plusHours(24);

        log.info("KIS Access Token 발급완료");
        return cachedToken;
    }
}
