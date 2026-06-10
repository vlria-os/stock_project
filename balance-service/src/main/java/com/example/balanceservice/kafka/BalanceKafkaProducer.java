package com.example.balanceservice.kafka;

import com.example.balanceservice.event.TradeResultEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class BalanceKafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendTradeResult(Long buyOrderId,Long buyerId, Long sellerId, Long amount, boolean success) {
        TradeResultEvent event = TradeResultEvent.builder()
                .buyOrderId(buyOrderId)
                .buyerId(buyerId)
                .sellerId(sellerId)
                .amount(amount)
                .success(success)
                .build();

        String topic = success ? "balance.trade.success" : "balance.trade.fail";
        kafkaTemplate.send(topic, objectMapper.writeValueAsString(event));
    }
}
