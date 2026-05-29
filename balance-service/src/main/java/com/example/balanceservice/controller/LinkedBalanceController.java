package com.example.balanceservice.controller;

import com.example.balanceservice.domain.LinkedBalance;
import com.example.balanceservice.dto.LinkedBalanceRequest;
import com.example.balanceservice.service.LinkedBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balance/linked")
@RequiredArgsConstructor
public class LinkedBalanceController {
    private final LinkedBalanceService linkedBalanceService;

    @GetMapping
    public ResponseEntity<List<LinkedBalance>> getLinkedBalances(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(linkedBalanceService.getLinkedBalances(userId));
    }

    @PostMapping
    public ResponseEntity<Void> addLinkedBalance(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody LinkedBalanceRequest request) {
        linkedBalanceService.addLinkedBalance(userId, request.getBankName(), request.getAccountNumber());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{linkedBalanceId}")
    public ResponseEntity<Void> deleteLinkedBalance(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long linkedBalanceId) {
        linkedBalanceService.deleteLinkedBalance(userId, linkedBalanceId);
        return ResponseEntity.ok().build();
    }
}
