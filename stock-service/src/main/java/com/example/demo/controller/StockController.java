package com.example.demo.controller;

import com.example.demo.dto.IndexPriceResponse;
import com.example.demo.dto.NewsItemResponse;
import com.example.demo.dto.StockChartResponse;
import com.example.demo.dto.StockListResponse;
import com.example.demo.dto.StockPriceResponse;
import com.example.demo.service.NewsService;
import com.example.demo.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stocks")
public class StockController {
    private final StockService stockService;
    private final NewsService newsService;

    //전체 종목 목록 조회
    @GetMapping
    public ResponseEntity<List<StockListResponse>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    //현재가 조회
    @GetMapping("/{code}/price")
    public ResponseEntity<StockPriceResponse> getStockPrice(@PathVariable String code){
        return ResponseEntity.ok(stockService.getStockPrice(code));
    }

    //KOSPI/KOSDAQ 지수 조회 (인증 불필요)
    @GetMapping("/index/{code}")
    public ResponseEntity<IndexPriceResponse> getIndexPrice(@PathVariable String code) {
        return ResponseEntity.ok(stockService.getIndexPrice(code));
    }

    //차트조회
    @GetMapping("/{code}/chart")
    public ResponseEntity<List<StockChartResponse>> getStockChart(@PathVariable String code){
        return ResponseEntity.ok(stockService.getStockChart(code));
    }

    // 한국경제 RSS 뉴스 (인증 불필요)
    @GetMapping("/news/main")
    public ResponseEntity<List<NewsItemResponse>> getMainNews() {
        return ResponseEntity.ok(newsService.getMainNews());
    }
}
