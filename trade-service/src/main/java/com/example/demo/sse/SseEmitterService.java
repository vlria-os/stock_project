package com.example.demo.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SseEmitterService {
    private final Map<Long, SseEmitter> emitters=new ConcurrentHashMap<>();

    //클라이언트가 SSE 연결 요청할 때
//    public SseEmitter connect(Long userId) {
//        SseEmitter emitter=new SseEmitter(Long.MAX_VALUE); //timeout 무제한
//
//        emitters.put(userId, emitter);
//
//        //연결 종료/timeout/error 시 MAP에서 제거
//        emitter.onCompletion(() -> emitters.remove(userId));
//        emitter.onTimeout(() -> emitters.remove(userId));
//        emitter.onError(e -> emitters.remove(userId));
//
//        //연결 직후 더미 이벤트 전송(연결 확인용)
//        try{
//            emitter.send(SseEmitter.event().name("connect").data("SSE_CONNECTED"));
//        } catch (IOException e) {
//            emitters.remove(userId);
//        }
//    }
}
