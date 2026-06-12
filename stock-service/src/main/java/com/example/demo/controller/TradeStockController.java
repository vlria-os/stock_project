package com.example.demo.controller;

import com.example.demo.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stock")
public class TradeStockController {
    private final StockService stockService;

    @GetMapping("/name")
    public ResponseEntity<?> getStockName(@RequestParam("stockCode") String stockCode){
        try {
            return ResponseEntity.ok(stockService.getStockName(stockCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/orderbook")
    public ResponseEntity<?> getStockList(){
        try {
            return ResponseEntity.ok(stockService.getStocksForTrade());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/code")
    public ResponseEntity<?> getStockCode(@RequestParam("stockName") String name){
        try {
            return ResponseEntity.ok(Map.of("code", stockService.getStockCode(name)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
