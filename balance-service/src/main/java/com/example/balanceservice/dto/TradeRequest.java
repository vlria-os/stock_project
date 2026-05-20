package com.example.balanceservice.dto;

import lombok.Getter;

@Getter
public class TradeRequest {
    private Long buyOrderId;
    private Long buyerId;
    private Long sellerId;
    private Long amount;
}
