package com.example.demo.kafka;

import com.example.demo.kafka.event.BalanceRequestEvent;
import com.example.demo.kafka.event.TradeCompletedEvent;
import com.example.demo.order.dto.ChatOrderResult;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeEventProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper=new ObjectMapper();

    public void sendBalanceRequest(BalanceRequestEvent event){
        kafkaTemplate.send("balance.trade.request", event);
    }

    public void sendTradeResult(TradeCompletedEvent event){
        kafkaTemplate.send("stock.result", event);
    }

    public void sendChatOrderResult(ChatOrderResult result) {
        kafkaTemplate.send("chat.order.result", result.getChatOrderId(), result);
    }
}
