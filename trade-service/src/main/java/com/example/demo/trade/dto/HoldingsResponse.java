package com.example.demo.trade.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class HoldingsResponse {
    private String stockCode;
    private String stockName;
    private Long holdings;
}
