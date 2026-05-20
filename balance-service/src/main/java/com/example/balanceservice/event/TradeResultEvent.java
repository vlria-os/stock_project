package com.example.balanceservice.event;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class TradeResultEvent {
    private Long buyOrderId;
    private Long buyerId;
    private Long sellerId;
    private Long amount;
    private boolean success;
}
