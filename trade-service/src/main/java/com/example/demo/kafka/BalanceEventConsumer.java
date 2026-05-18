package com.example.demo.kafka;

import com.example.demo.kafka.event.BalanceDeductedEvent;
import com.example.demo.kafka.event.BalanceFailedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BalanceEventConsumer {

    @KafkaListener(topics = "balance.deducted", groupId = "trade-service")
    public void handleBalanceDeducted(BalanceDeductedEvent event) {
        // 서비스 코드 짜면서 채울 예정
    }

    @KafkaListener(topics = "balance.failed", groupId = "trade-service")
    public void handleBalanceFailed(BalanceFailedEvent event) {
        // 서비스 코드 짜면서 채울 예정
    }
}
