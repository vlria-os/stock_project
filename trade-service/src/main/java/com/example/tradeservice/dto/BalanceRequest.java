package com.example.tradeservice.dto;

import lombok.Getter;

@Getter
public class BalanceRequest {
    private Long amount;
    private String idempotencyKey;
}
