package com.example.demo.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendUserCreated(Long userId){
        kafkaTemplate.send("user-created", String.valueOf(userId));
    }

    public void sendUserWithdrawn(Long userId){
        kafkaTemplate.send("user.withdrawn", String.valueOf(userId))
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("user.withdrawn 전송 실패 userId={} error={}", userId, ex.getMessage());
                    } else {
                        log.info("user.withdrawn 전송 성공 userId={}", userId);
                    }
                });
    }
}