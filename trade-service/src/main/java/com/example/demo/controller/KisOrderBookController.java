package com.example.demo.controller;

import com.example.demo.websocket.KisWebSocketClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class KisOrderBookController {
    private final KisWebSocketClient kisWebSocketClient;

    @MessageMapping("/stock/subscribe")
    public void handleStockSubscribe(String stockCode) {
        log.info("[STOMP 구독] 현재 파드에서 KIS 연동 엔진을 가동합니다. 종목코드: {}", stockCode);
        kisWebSocketClient.subscribe(stockCode);
    }

    @MessageMapping("/stock/unsubscribe")
    public void handleStockUnsubscribe(String stockCode) {
        log.info("[STOMP 해제] 현재 파드에서 KIS 연동 엔진 구독 해제를 요청합니다. 종목코드: {}", stockCode);
        kisWebSocketClient.unsubscribe(stockCode);
    }
}