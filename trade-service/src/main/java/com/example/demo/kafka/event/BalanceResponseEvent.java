package com.example.demo.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BalanceResponseEvent {
    private Long buyOrderId;
    private Long buyerId;
    private Long sellerId;
    private Long amount;
    private boolean success;
}
