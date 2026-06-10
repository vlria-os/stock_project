package com.example.demo.client;

import com.example.demo.client.dto.Stock;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "stock-service", url = "${stock.service.url}")
public interface StockClient {

    @GetMapping("/api/stock/name")
    String getStockName(@RequestParam("stockCode") String stockCode);

    @GetMapping("/api/stock/orderbook")
    List<Stock> getStockList();

}
