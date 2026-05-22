package com.example.demo.kafka;

import com.example.demo.kafka.event.BalanceRequestEvent;
import com.example.demo.kafka.event.TradeCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendBalanceRequest(BalanceRequestEvent event){
        kafkaTemplate.send("balance.request", event);
    }

    public void sendTradeResult(TradeCompletedEvent event){
        kafkaTemplate.send("stock.result", event);
    }
}
