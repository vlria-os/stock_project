package com.example.demo.controller;

import com.example.demo.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/code")
    public ResponseEntity<?> getStockCode(@RequestBody Map<String, String> body){
        try {
            String stockName = body.get("stockName");
            return ResponseEntity.ok(Map.of("code", stockService.getStockCode(stockName)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
