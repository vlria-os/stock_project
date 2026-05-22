package com.example.demo.client.dto;

import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TradeRequest {
    private String stockCode;
    private Side side;
    private OrderType orderType;
    private OrderCondition orderCondition;
    private Long price;
    private Long quantity;
    private LocalDate expiredAt;
}
