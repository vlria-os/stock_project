package com.example.demo.order.dto;

import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
import com.example.demo.order.enums.Status;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderHistoryResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private String stockCode;
    private String stockName;
    private OrderType orderType;
    private OrderCondition orderCondition;
    private Side side;
    private Long price;
    private Long quantity;
    private Long filledQuantity;
    private Long remainingQuantity;
    private Status status;
    private LocalDateTime createdAt;
}
