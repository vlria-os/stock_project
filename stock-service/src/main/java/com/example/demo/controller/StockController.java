package com.example.demo.controller;

import com.example.demo.dto.StockChartResponse;
import com.example.demo.dto.StockPriceResponse;
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

    //현재가 조회
    @GetMapping("/{code}/price")
    public ResponseEntity<StockPriceResponse> getStockPrice(@PathVariable String code){
        return ResponseEntity.ok(stockService.getStockPrice(code));
    }

    //차트조회
    @GetMapping("/{code}/chart")
    public ResponseEntity<List<StockChartResponse>> getStockChart(@PathVariable String code){
        return ResponseEntity.ok(stockService.getStockChart(code));
    }
}
