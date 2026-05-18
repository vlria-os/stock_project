package com.example.balanceservice.controller;

import com.example.balanceservice.event.TradeResultEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BalanceKafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendTradeResult(Long buyerId, Long sellerId, Long amount, boolean success) {
        TradeResultEvent event = TradeResultEvent.builder()
                .buyerId(buyerId)
                .sellerId(sellerId)
                .amount(amount)
                .success(success)
                .build();

        String topic = success ? "balance.trade.success" : "balance.trade.fail";
        kafkaTemplate.send(topic, event);
    }
}
