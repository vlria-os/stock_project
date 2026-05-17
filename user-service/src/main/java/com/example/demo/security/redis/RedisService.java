package com.example.demo.security.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    private String key(Long userId){
        return "refresh:user:" + userId;
    }

    public void save(Long userId, String refreshToken, long expireMin){
        try{
            redisTemplate.opsForValue().set(key(userId), refreshToken, expireMin, TimeUnit.MINUTES);
        }catch (RedisConnectionFailureException e){
            log.warn("[Redis연결 없음] refresh token 저장 스킵 - userId:{}", userId);
        }
    }

    public String get(Long userId){
        try{
            return (String) redisTemplate.opsForValue().get(key(userId));
        }catch (RedisConnectionFailureException e){
            log.warn("[Redis 연결 없음] refresh token 조회 스킵 - userId: {}", userId);
            return null;
        }
    }

    public  void delete(Long userId){
        try {
            redisTemplate.delete(key(userId));
        }catch (RedisConnectionFailureException e){
            log.warn("[Redis 연결 없음] refresh token 삭제 스킵 - userId:{}", userId);
        }
    }
}
