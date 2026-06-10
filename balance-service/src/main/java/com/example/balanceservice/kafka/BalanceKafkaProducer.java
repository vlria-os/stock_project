package com.example.balanceservice.kafka;

import com.example.balanceservice.event.TradeResultEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper; // 올바른 import

@Component
@RequiredArgsConstructor
public class BalanceKafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendTradeResult(Long buyOrderId,Long buyerId, Long sellerId, Long amount, boolean success) {
        TradeResultEvent event = TradeResultEvent.builder()
                .buyOrderId(buyOrderId)
                .buyerId(buyerId)
                .sellerId(sellerId)
                .amount(amount)
                .success(success)
                .build();

        String topic = success ? "balance.trade.success" : "balance.trade.fail";

        try {
            kafkaTemplate.send(topic, objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
