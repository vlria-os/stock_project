package com.example.demo.trade.dto;

import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
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
public class TradeHistoryResponse {
    private Long id;
    private Long tradeId;
    private Long userId;
    private String stockCode;
    private String stockName;
    private Side side;
    private OrderType orderType;
    private OrderCondition orderCondition;
    private Long quantity;
    private Long price;
    private Long totalAmount;
    private LocalDateTime createdAt;
}
