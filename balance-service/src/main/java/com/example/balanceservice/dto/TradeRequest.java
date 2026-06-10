package com.example.balanceservice.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TradeRequest {
    private Long buyOrderId;
    private Long buyerId;
    private Long sellerId;
    private Long amount;
}
