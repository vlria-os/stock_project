package com.example.demo.kafka;

import com.example.demo.service.WishlistService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {
    private final WishlistService wishlistService;

    @Getter
    private final List<String> eventLog = Collections.synchronizedList(new ArrayList<>());

    @KafkaListener(topics = "user.withdrawn", groupId = "stock-service")
    public void handleUserWithdrawn(String userId){
        log.info("유저 탈퇴 이벤트 수신 - raw: [{}]", userId);
        try {
            long id = Long.parseLong(userId.trim());
            wishlistService.deleteByUserId(id);
            String record = LocalDateTime.now() + " | userId=" + id + " | 삭제완료";
            eventLog.add(record);
            log.info("위시리스트 삭제 완료 - userId: {}", id);
        } catch (NumberFormatException e) {
            eventLog.add(LocalDateTime.now() + " | raw=[" + userId + "] | 파싱실패");
            log.error("유저 ID 파싱 실패 - raw: [{}]", userId, e);
        } catch (Exception e) {
            eventLog.add(LocalDateTime.now() + " | userId=" + userId + " | 오류=" + e.getMessage());
            log.error("위시리스트 삭제 실패 - userId: {}", userId, e);
        }
    }
}
