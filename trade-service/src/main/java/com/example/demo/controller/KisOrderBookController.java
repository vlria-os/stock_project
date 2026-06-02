package com.example.demo.controller;

import com.example.demo.websocket.KisWebSocketClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trade/orderbook")
public class KisOrderBookController {
    private final KisWebSocketClient kisWebSocketClient;

    @PostMapping("/subscribe/{stockCode}")
    public ResponseEntity<Void> subscribe(@PathVariable String stockCode){
        kisWebSocketClient.subscribe(stockCode);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unsubscribe/{stockCode}")
    public ResponseEntity<Void> unsubscribe(@PathVariable String stockCode){
        kisWebSocketClient.unsubscribe(stockCode);
        return ResponseEntity.ok().build();
    }
}
