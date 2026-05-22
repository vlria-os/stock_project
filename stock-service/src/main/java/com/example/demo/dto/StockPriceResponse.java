package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
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
}
