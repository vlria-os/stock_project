package com.example.demo.dto;

import com.example.demo.entity.Stock;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Getter
@NoArgsConstructor
public class StockPriceResponse {
    @JsonProperty("stck_shrn_iscd")
    private String stockCode;       // 종목코드
    @JsonProperty("stck_prpr")
    private String currentPrice;    // 현재가
    @JsonProperty("prdy_vrss")
    private String priceChange;     // 전일 대비 변동액
    @JsonProperty("prdy_ctrt")
    private String changeRate;      // 전일 대비 등락률(%)
    @JsonProperty("acml_vol")
    private String volume;          // 누적 거래량
    @JsonProperty("stck_hgpr")
    private String highPrice;       // 당일 고가
    @JsonProperty("stck_lwpr")
    private String lowPrice;        // 당일 저가

    // KIS API 호출 실패 시 DB 캐시에서 생성
    public StockPriceResponse(Stock stock) {
        BigDecimal curr = stock.getCurrentPrice() != null ? stock.getCurrentPrice() : BigDecimal.ZERO;
        BigDecimal prev = stock.getPrevPrice() != null ? stock.getPrevPrice() : BigDecimal.ZERO;
        BigDecimal change = curr.subtract(prev);

        this.stockCode = stock.getCode();
        this.currentPrice = curr.toPlainString();
        this.priceChange = change.toPlainString();
        this.changeRate = prev.compareTo(BigDecimal.ZERO) != 0
                ? change.divide(prev, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP).toPlainString()
                : "0.00";
        this.volume = stock.getVolume() != null ? stock.getVolume().toString() : "0";
        this.highPrice = "0";
        this.lowPrice = "0";
    }
}
