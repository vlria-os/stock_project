package com.example.demo.kafka;

import com.example.demo.dto.TradeExecutedEvent;
import com.example.demo.service.StockService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TradeEventConsumer {
    private final StockService stockService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TradeEventConsumer(StockService stockService) {
        this.stockService = stockService;
    }

    @KafkaListener(topics = "stock.result", groupId = "stock-service")
    public void handleTradeExecuted(String message) {
        try {
            TradeExecutedEvent event = objectMapper.readValue(message, TradeExecutedEvent.class);
            log.info("체결 이벤트 수신 - stockCode={}, quantity={}, isSystemSeller={}",
                    event.getStockCode(), event.getQuantity(), event.isSystemSeller());
            stockService.handleTradeExecution(event);
        } catch (Exception e) {
            log.error("체결 이벤트 처리 실패 - message={}", message, e);
        }
    }
}