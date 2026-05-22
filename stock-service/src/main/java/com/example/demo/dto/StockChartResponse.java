package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class StockChartResponse {

    @JsonProperty("stck_bsop_date")
    private String date;        // 날짜

    @JsonProperty("stck_oprc")
    private String openPrice;   // 시가

    @JsonProperty("stck_hgpr")
    private String highPrice;   // 고가

    @JsonProperty("stck_lwpr")
    private String lowPrice;    // 저가

    @JsonProperty("stck_clpr")
    private String closePrice;  // 종가

    @JsonProperty("acml_vol")
    private String volume;      // 거래량
}