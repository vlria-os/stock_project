package com.example.balanceservice.controller;

import com.example.balanceservice.domain.BalanceHistory;
import com.example.balanceservice.dto.BalanceRequest;
import com.example.balanceservice.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balance")
@RequiredArgsConstructor
public class BalanceController {
    private final BalanceService balanceService;

    @GetMapping
    public ResponseEntity<Long> getBalance(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(balanceService.getBalance(userId));
    }

    @PostMapping("/deposit")
    public ResponseEntity<Void> deposit(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody BalanceRequest request) {
        balanceService.deposit(userId, request.getAmount(), request.getIdempotencyKey());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody BalanceRequest request) {
        balanceService.withdraw(userId, request.getAmount(), request.getIdempotencyKey());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<BalanceHistory>> getHistory(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(balanceService.getHistory(userId));
    }
}
