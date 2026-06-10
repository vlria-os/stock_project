package com.example.demo.controller;

import com.example.demo.client.dto.TradeRequest;
import com.example.demo.order.dto.OrderHistoryResponse;
import com.example.demo.order.entity.OrderHistory;
import com.example.demo.order.enums.Status;
import com.example.demo.service.TradeService;
import com.example.demo.sse.SseEmitterService;
import com.example.demo.trade.dto.HoldingsResponse;
import com.example.demo.trade.dto.TradeHistoryResponse;
import com.example.demo.trade.entity.TradeHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @DeleteMapping("/order/{id}")
    public ResponseEntity<?> cancelOrder(@RequestHeader("X-User-Id") Long userId,
                                         @PathVariable Long id){
        try {
            Long orderId= tradeService.cancelOrder(id, userId);
            return ResponseEntity.ok(orderId);
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrderHistory(@RequestHeader("X-User-Id") Long userId,
                                               @RequestParam(value = "status", required = false) Status status,
                                               Pageable pageable){
        try {
            Page<OrderHistoryResponse> orderHistories=tradeService.getMyOrderHistory(userId, status, pageable);
            return ResponseEntity.ok(orderHistories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/trades")
    public ResponseEntity<?> getMyTradeHistory(@RequestHeader("X-User-Id") Long userId, Pageable pageable){
        try {
            Page<TradeHistoryResponse> tradeHistories=tradeService.getMyTradeHistory(userId, pageable);
            return ResponseEntity.ok(tradeHistories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/holdings")
    public ResponseEntity<?> getMyHoldings(@RequestHeader("X-User-Id") Long userId, Pageable pageable){
        try {
            Page<HoldingsResponse> responses=tradeService.getMyHoldings(userId, pageable);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/sse/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@RequestHeader(value = "X-User-Id", required = false) Long userId){
        if (userId == null){
            userId = 15L;
        }
        return sseEmitterService.connect(userId);
    }
}
