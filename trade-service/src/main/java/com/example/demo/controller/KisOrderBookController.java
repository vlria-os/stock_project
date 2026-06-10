package com.example.demo.controller;

import com.example.demo.websocket.KisWebSocketClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trade/orderbook")
public class KisOrderBookController {
    private final KisWebSocketClient kisWebSocketClient;

    @PostMapping("/subscribe/{stockCode}")
    public ResponseEntity<Void> subscribe(@PathVariable String stockCode){
        log.info("구독 요청: {}", stockCode);
        kisWebSocketClient.subscribe(stockCode);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unsubscribe/{stockCode}")
    public ResponseEntity<Void> unsubscribe(@PathVariable String stockCode){
        kisWebSocketClient.unsubscribe(stockCode);
        return ResponseEntity.ok().build();
    }
}
