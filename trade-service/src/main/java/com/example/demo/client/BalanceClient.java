package com.example.demo.client;

import com.example.demo.client.dto.BalanceOrderRequest;
import com.example.demo.client.dto.BalanceOrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "balance-service", url = "${balance.service.url}")
public interface BalanceClient {

    @GetMapping ("/api/balance")
    Long orderBalance(@RequestHeader("X-User-Id") Long userId);
}
