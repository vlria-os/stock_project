package com.example.balanceservice.controller;

import com.example.balanceservice.dto.LockRequest;
import com.example.balanceservice.dto.TradeRequest;
import com.example.balanceservice.service.BalanceService;
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
                request.getBuyOrderId(),
                request.getBuyerId(),
                request.getSellerId(),
                request.getAmount()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/lock")
    public ResponseEntity<Void> lockBalance(@RequestBody LockRequest request) {
        balanceService.lockBalance(request.getUserId(), request.getAmount(), request.getIdempotencyKey());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unlock")
    public ResponseEntity<Void> unlockBalance(@RequestBody LockRequest request) {
        balanceService.unlockBalance(request.getUserId(), request.getAmount(), request.getIdempotencyKey());
        return ResponseEntity.ok().build();
    }
}
