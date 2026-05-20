package com.example.demo.controller;

import com.example.demo.client.dto.TradeRequest;
import com.example.demo.service.TradeService;
import com.example.demo.sse.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/trade")
public class TradeController {
    private final TradeService tradeService;
    private final SseEmitterService sseEmitterService;

    @PostMapping("/order")
    public ResponseEntity<?> placeOrder(@RequestHeader("X-User-Id") Long userId,
                                        @RequestBody TradeRequest request){
        try{
            tradeService.placeOrder(userId, request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/sse/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@RequestHeader("X-User-Id") Long userId){
        return sseEmitterService.connect(userId);
    }
}
