package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.IndexPrice;
import com.example.demo.entity.Stock;
import com.example.demo.kis.KisTokenService;
import com.example.demo.repository.IndexPriceRepository;
import com.example.demo.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    private final WebClient kisWebClient;
    private final KisTokenService kisTokenService;
    private final StockRepository stockRepository;
    private final IndexPriceRepository indexPriceRepository;

    private final Map<String, IndexPriceResponse> indexPriceCache = new ConcurrentHashMap<>();

    @Value("${kis.app-key}")
    private String appKey;

    @Value("${kis.app-secret}")
    private String appSecret;

    public String getStockCode(String stockName){
        return stockRepository.findCodeByName(stockName).orElse(null);

    }

    //종목 코드, 잔여 발행 수량, 기준가 조회
    public List<TradeStockResponse> getStocksForTrade(){
        return stockRepository.findAll().stream().map(
                stock -> {
                    return TradeStockResponse.builder()
                            .code(stock.getCode())
                            .remainingShares((long) stock.getRemainingShares())
                            .listingPrice(stock.getListingPrice().longValue())
                            .build();
                }
        ).toList();
    }

    //종목 이름 조회
    public String getStockName(String code){
        return stockRepository.findByCode(code).orElseThrow().getName();
    }

    //현재가 조회 (KIS API 실패 시 DB 캐시 반환)
    public StockPriceResponse getStockPrice(String stockCode) {
        try {
            String token = kisTokenService.getAccessToken();
            String uri = "/uapi/domestic-stock/v1/quotations/inquire-price"
                    + "?fid_cond_mrkt_div_code=J&fid_input_iscd=" + stockCode;

            StockPriceResponse response = kisWebClient.get().uri(uri)
                    .header("Authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", "FHKST01010100")
                    .retrieve()
                    .bodyToMono(KisPriceApiResponse.class)
                    .map(KisPriceApiResponse::getOutput)
                    .block();

            if (response != null && response.getCurrentPrice() != null) {
                return response;
            }
        } catch (Exception e) {
            log.warn("KIS API 호출 실패, DB 캐시 반환: stockCode={}", stockCode, e);
        }

        return stockRepository.findByCode(stockCode)
                .map(StockPriceResponse::new)
                .orElseThrow(() -> new RuntimeException("종목을 찾을 수 없습니다: " + stockCode));
    }
    // KOSPI/KOSDAQ 지수 조회 (KIS API 실패 시 메모리 캐시 → DB 순으로 fallback)
    public IndexPriceResponse getIndexPrice(String indexCode) {
        try {
            String token = kisTokenService.getAccessToken();
            String uri = "/uapi/domestic-stock/v1/quotations/inquire-index-price"
                    + "?fid_cond_mrkt_div_code=U&fid_input_iscd=" + indexCode;

            IndexPriceResponse response = kisWebClient.get().uri(uri)
                    .header("Authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", "FHPUP02100000")
                    .retrieve()
                    .bodyToMono(KisIndexApiResponse.class)
                    .map(KisIndexApiResponse::getOutput)
                    .block();

            if (response != null && response.getCurrentPrice() != null) {
                indexPriceCache.put(indexCode, response);
                persistIndexPrice(indexCode, response);
                return response;
            }
        } catch (Exception e) {
            log.warn("KIS 지수 API 호출 실패, fallback 시도: indexCode={}", indexCode, e);
        }

        IndexPriceResponse cached = indexPriceCache.get(indexCode);
        if (cached != null) {
            return cached;
        }

        return indexPriceRepository.findByIndexCode(indexCode)
                .map(ip -> new IndexPriceResponse(ip.getCurrentPrice(), ip.getPriceChange(), ip.getChangeRate(), ip.getSign()))
                .orElseThrow(() -> new RuntimeException("지수 데이터를 조회할 수 없습니다: " + indexCode));
    }

    private void persistIndexPrice(String indexCode, IndexPriceResponse response) {
        try {
            IndexPrice entity = indexPriceRepository.findByIndexCode(indexCode)
                    .orElseGet(() -> IndexPrice.builder().indexCode(indexCode).build());
            entity.update(response.getCurrentPrice(), response.getPriceChange(), response.getChangeRate(), response.getSign());
            indexPriceRepository.save(entity);
        } catch (Exception e) {
            log.warn("지수 가격 DB 저장 실패: indexCode={}", indexCode, e);
        }
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

    // 체결 이벤트 처리 (Kafka TradeEventConsumer에서 호출)
    @Transactional
    public void handleTradeExecution(TradeExecutedEvent event) {
        stockRepository.findByCode(event.getStockCode()).ifPresent(stock -> {
            if (event.isSystemSeller()) {
                stock.deductShares(event.getQuantity());
                log.info("시스템 매도 체결 - stockCode={}, 차감수량={}, 잔여수량={}",
                        event.getStockCode(), event.getQuantity(), stock.getRemainingShares());
            }
            stock.updatePrice(
                    BigDecimal.valueOf(event.getPrice()),
                    stock.getCurrentPrice(),
                    (long) event.getQuantity()
            );
        });
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
