package com.example.demo.service;

import com.example.demo.client.KisAuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KisTokenService {
    @Value("${trade.kis.app.key}")
    private String appKey;

    @Value("${trade.kis.app.secret}")
    private String appSecret;

    private final KisAuthClient kisAuthClient;

    public String getApprovalKey(){
        Map<String, String> body=new HashMap<>();
        body.put("grant_type", "client_credentials");
        body.put("appkey", appKey);
        body.put("secretkey", appSecret);

        Map<String, String> response=kisAuthClient.getApprovalKey(body);
        return response.get("approval_key");
    }
}
