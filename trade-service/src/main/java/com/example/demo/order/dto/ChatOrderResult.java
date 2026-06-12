package com.example.demo.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ChatOrderResult {
    private String chatOrderId;
    private boolean success;
    private String stockName;
    private Long quantity;
}
