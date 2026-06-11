package com.example.demo.order.dto;

import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
import com.example.demo.order.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderPendingResponse {
    private Long id;
    private Long userId;
    private String stockCode;
    private String stockName;
    private Side side;
    private OrderType orderType;
    private OrderCondition orderCondition;
    private Long price;
    private Long quantity;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDate expiredAt;
}
