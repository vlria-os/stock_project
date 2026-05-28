package com.example.balanceservice.kafka;

import com.example.balanceservice.domain.Balance;
import com.example.balanceservice.event.UserCreatedEvent;
import com.example.balanceservice.repository.BalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserCreatedConsumer {
    private final BalanceRepository balanceRepository;

    @KafkaListener(topics = "user-created", groupId = "balance-service")
    public void consume(UserCreatedEvent event) {
        balanceRepository.save(Balance.create(event.getUserId()));
    }
}
