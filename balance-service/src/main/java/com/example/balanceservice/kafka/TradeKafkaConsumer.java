package com.example.balanceservice.kafka;

import com.example.balanceservice.dto.TradeRequest;
import com.example.balanceservice.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class TradeKafkaConsumer {
    private final BalanceService balanceService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "balance.trade.request", groupId = "balance-service")
    public void getTradeRequest(String message){
        TradeRequest request = objectMapper.readValue(message, TradeRequest.class);

        balanceService.executeTrade(
                request.getBuyOrderId(),
                request.getBuyerId(),
                request.getSellerId(),
                request.getAmount()
        );
    }
}
