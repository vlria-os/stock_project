package com.example.demo.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendUserCreated(Long userId){
        kafkaTemplate.send("user-created", String.valueOf(userId));
    }
}
