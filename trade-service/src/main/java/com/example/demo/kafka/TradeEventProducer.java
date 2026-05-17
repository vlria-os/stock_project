package com.example.demo.kafka;

import com.example.demo.kafka.event.OrderMatchedEvent;
import com.example.demo.kafka.event.TradeCompletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderMatched(OrderMatchedEvent event) {
        kafkaTemplate.send("order.matched", event);
    }

    public void publishTradeCompleted(TradeCompletedEvent event) {
        kafkaTemplate.send("trade.completed", event);
    }
}
