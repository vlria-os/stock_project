package com.example.balanceservice.kafka;

import com.example.balanceservice.dto.TradeRequest;
import com.example.balanceservice.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeKafkaConsumer {
    private final BalanceService balanceService;

    @KafkaListener(topics = "balance.trade.request", groupId = "balance-service")
    public void getTradeRequest(TradeRequest request){
        balanceService.executeTrade(
                request.getBuyOrderId(),
                request.getBuyerId(),
                request.getSellerId(),
                request.getAmount()
        );
    }
}
