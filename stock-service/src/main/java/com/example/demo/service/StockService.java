package com.example.demo.service;

import com.example.demo.dto.KisChartApiResponse;
import com.example.demo.dto.KisPriceApiResponse;
import com.example.demo.dto.StockChartResponse;
import com.example.demo.dto.StockListResponse;
import com.example.demo.dto.StockPriceResponse;
import com.example.demo.entity.Stock;
import com.example.demo.kis.KisTokenService;
import com.example.demo.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    private final WebClient kisWebClient;
    private final KisTokenService kisTokenService;
    private final StockRepository stockRepository;

    @Value("${kis.app-key}")
    private String appKey;

    @Value("${kis.app-secret}")
    private String appSecret;

    //현재가 조회
    public StockPriceResponse getStockPrice(String stockCode) {
        String token = kisTokenService.getAccessToken();
        String uri = "/uapi/domestic-stock/v1/quotations/inquire-price"
                + "?fid_cond_mrkt_div_code=J&fid_input_iscd=" + stockCode;

        WebClient.RequestHeadersSpec<?> request = kisWebClient.get().uri(uri);

        return request
                .header("Authorization", "Bearer " + token)
                .header("appkey", appKey)
                .header("appsecret", appSecret)
                .header("tr_id", "FHKST01010100")
                .retrieve()
                .bodyToMono(KisPriceApiResponse.class)
                .map(KisPriceApiResponse::getOutput)
                .block();
    }
    //차트조회(일봉 기준 30일)
    public List<StockChartResponse> getStockChart(String stockCode) {
        String token = kisTokenService.getAccessToken();
        String uri = "/uapi/domestic-stock/v1/quotations/inquire-daily-price"
                + "?fid_cond_mrkt_div_code=J&fid_input_iscd=" + stockCode
                + "&fid_period_div_code=D&fid_org_adj_prc=0";

        WebClient.RequestHeadersSpec<?> request = kisWebClient.get().uri(uri);

        return request
                .header("Authorization", "Bearer " + token)
                .header("appkey", appKey)
                .header("appsecret", appSecret)
                .header("tr_id", "FHKST01010400")
                .retrieve()
                .bodyToMono(KisChartApiResponse.class)
                .map(KisChartApiResponse::getOutput2)
                .block();
    }
    // 전체 종목 목록 조회
    public List<StockListResponse> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(StockListResponse::new)
                .toList();
    }

    // stocks 테이블 현재가 업데이트(스케줄러에서 호출)
    @Transactional
    public void updateStockCache(String stockCode) {
        try{
            StockPriceResponse priceResponse = getStockPrice(stockCode);

            Optional<Stock> optionalStock = stockRepository.findByCode(stockCode);

            if(optionalStock.isPresent()) {
                BigDecimal current = new BigDecimal(priceResponse.getCurrentPrice());
                BigDecimal change = new BigDecimal(priceResponse.getPriceChange());
                BigDecimal prev = current.subtract(change);
                optionalStock.get().updatePrice(
                        current,
                        prev,
                        Long.parseLong(priceResponse.getVolume())
                );
            }
        }catch (Exception e){
            log.error("종목 캐시 업데이트 실패: {}", stockCode, e);
        }
    }
}
