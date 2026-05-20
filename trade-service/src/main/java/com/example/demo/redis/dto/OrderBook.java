package com.example.demo.redis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderBook {
    private Long orderId;
    private Long userId;
    private Long price;
    private Long remainingQuantity;
}
