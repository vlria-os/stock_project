package com.example.tradeservice.controller;

import com.example.tradeservice.dto.TradeRequest;
import com.example.tradeservice.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/balance")
@RequiredArgsConstructor
public class BalanceInternalController {
    private final BalanceService balanceService;

    @PostMapping("/trade")
    public ResponseEntity<Void> executeTrade(@RequestBody TradeRequest request) {
        balanceService.executeTrade(
                request.getBuyerId(),
                request.getSellerId(),
                request.getAmount(),
                request.getIdempotencyKey()
        );
        return ResponseEntity.ok().build();
    }
}
