package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TradeExecutedEvent {
    private String stockCode;
    private int quantity;
    private long price;
    private boolean isSystemSeller;
}