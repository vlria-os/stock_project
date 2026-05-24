package com.example.demo.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisLockManager {
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisMessageListenerContainer listenerContainer;

    private static final long LOCK_TIMEOUT_SECONDS=60;
    private static final String UNLOCK_CHANNEL="lock:unlock:";

    public void lock(String key){
        while (true){
            Boolean result=redisTemplate.opsForValue()
                    .setIfAbsent(key, "locked", Duration.ofSeconds(LOCK_TIMEOUT_SECONDS));

            if (Boolean.TRUE.equals(result)) return;

            BlockingQueue<String> queue=new LinkedBlockingQueue<>();
            MessageListener listener=(message, pattern) -> queue.offer(UNLOCK_CHANNEL + key);
            ChannelTopic topic=new ChannelTopic(UNLOCK_CHANNEL + key);

            listenerContainer.addMessageListener(listener, topic);

            try{
                queue.poll(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            }catch (InterruptedException e){
                Thread.currentThread().interrupt();
            }finally {
                listenerContainer.removeMessageListener(listener, topic);
            }
        }
    }

    public void unlock(String key){
        redisTemplate.delete(key);
        redisTemplate.convertAndSend(UNLOCK_CHANNEL + key, "unlocked");
    }
}
