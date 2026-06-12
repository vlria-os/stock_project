package com.example.demo.kafka;

import com.example.demo.client.dto.TradeRequest;
import com.example.demo.order.dto.ChatOrderResult;
import com.example.demo.service.TradeService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatOrderConsumer {
    private final TradeService tradeService;
    private final TradeEventProducer tradeEventProducer;
    private final ObjectMapper objectMapper=new ObjectMapper();

    @KafkaListener(topics = "chat.order.request", groupId = "trade-service",
        properties = {"value.deserializer=org.apache.kafka.common.serialization.StringDeserializer"})
    public void handleChatOrder(String message) throws JsonProcessingException{
        TradeRequest request=objectMapper.readValue(message, TradeRequest.class);

        try {
            tradeService.placeOrder(request.getUserId(), request);
        } catch (IllegalArgumentException e){
            tradeEventProducer.sendChatOrderResult(ChatOrderResult.builder()
                    .chatOrderId(request.getChatOrderId())
                    .success(false)
                    .stockName(request.getStockName())
                    .quantity(request.getQuantity())
                    .message(e.getMessage())
                    .build());
        }
    }

}
