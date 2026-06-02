package com.example.demo.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "kis-auth", url = "${trade.kis.rest.url}")
public interface KisAuthClient {

    @PostMapping("/oauth2/Approval")
    Map<String, String> getApprovalKey(@RequestBody Map<String, String> body);
}
