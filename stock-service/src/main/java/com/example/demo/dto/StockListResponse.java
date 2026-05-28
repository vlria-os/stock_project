package com.example.demo.dto;

import com.example.demo.entity.Stock;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class StockListResponse {
    private String code;
    private String name;
    private String market;
    private BigDecimal currentPrice;
    private BigDecimal prevPrice;

    public StockListResponse(Stock stock) {
        this.code = stock.getCode();
        this.name = stock.getName();
        this.market = stock.getMarket();
        this.currentPrice = stock.getCurrentPrice();
        this.prevPrice = stock.getPrevPrice();
    }
}