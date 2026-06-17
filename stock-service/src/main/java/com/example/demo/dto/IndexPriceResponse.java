package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class IndexPriceResponse {
    @JsonProperty("bstp_nmix_prpr")
    private String currentPrice;     // 업종 지수 현재값

    @JsonProperty("bstp_nmix_prdy_vrss")
    private String priceChange;      // 전일 대비 변동

    @JsonProperty("bstp_nmix_prdy_ctrt")
    private String changeRate;       // 등락률(%)

    @JsonProperty("prdy_vrss_sign")
    private String sign;             // 부호 (1:상한, 2:상승, 3:보합, 4:하한, 5:하락)

    public IndexPriceResponse(String currentPrice, String priceChange, String changeRate, String sign) {
        this.currentPrice = currentPrice;
        this.priceChange = priceChange;
        this.changeRate = changeRate;
        this.sign = sign;
    }
}