package com.example.demo.kafka;

import com.example.demo.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {
    private final WishlistService wishlistService;

    @KafkaListener(topics = "user.withdrawn", groupId = "stock-service")
    public void handleUserWithdrawn(String userId){
        log.info("유저 탈퇴 이벤트 수신 : {}", userId);
        wishlistService.deleteByUserId(Long.parseLong(userId));
    }
}
