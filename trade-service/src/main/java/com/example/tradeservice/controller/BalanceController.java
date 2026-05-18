package com.example.tradeservice.controller;

import com.example.tradeservice.domain.BalanceHistory;
import com.example.tradeservice.dto.BalanceRequest;
import com.example.tradeservice.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balance")
@RequiredArgsConstructor
public class BalanceController {
    private final BalanceService balanceService;

    @GetMapping("/{userId}")
    public ResponseEntity<Long> getBalance(@PathVariable Long userId) {
        return ResponseEntity.ok(balanceService.getBalance(userId));
    }

    @PostMapping("/{userId}/deposit")
    public ResponseEntity<Void> deposit(
            @PathVariable Long userId,
            @RequestBody BalanceRequest request) {
        balanceService.deposit(userId, request.getAmount(), request.getIdempotencyKey());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/withdraw")
    public ResponseEntity<Void> withdraw(
            @PathVariable Long userId,
            @RequestBody BalanceRequest request) {
        balanceService.withdraw(userId, request.getAmount(), request.getIdempotencyKey());
        return ResponseEntity.ok().build();
    }
}
