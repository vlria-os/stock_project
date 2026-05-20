package com.example.demo.kafka.event;

import com.example.demo.order.enums.OrderCondition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BalanceRequestEvent {
    private Long buyOrderId;
    private Long buyerId;
    private Long sellerId;
    private Long amount;
}
