package com.example.demo.websocket;

import com.example.demo.service.KisTokenService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class KisWebSocketClient {
    @Value("${trade.kis.ws.url}")
    private String wsUrl;

    @Value("${trade.kis.app.key}")
    private String appKey;

    @Value("${trade.kis.app.secret}")
    private String appSecret;

    private final KisTokenService kisTokenService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private OkHttpClient client;
    private WebSocket webSocket;

    @PostConstruct
    public void connect(){
        client = new OkHttpClient.Builder()
                .pingInterval(30, TimeUnit.SECONDS)
                .build();

        String approvalKey= kisTokenService.getApprovalKey();

        Request request=new Request.Builder()
                .url(wsUrl)
                .build();

        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
                log.info("KIS WebSocket 연결 성공");
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull String text) {
                try {
                    if (text.startsWith("{") || text.startsWith("0|H0STASP0|000")) return;

                    String[] parts = text.split("\\|");
                    if (parts.length < 4) return;

                    String trId = parts[1];
                    if (!"H0STASP0".equals(trId)) return;

                    String[] fields = parts[3].split("\\^");

                    Map<String, Object> orderBook = new HashMap<>();
                    orderBook.put("stockCode", fields[0]);
                    orderBook.put("time", fields[1]);

                    // 매도 호가 (ASKP1~10: index 3~12, 잔량: index 23~32)
                    List<Map<String, Object>> askPrices = new ArrayList<>();
                    for (int i = 0; i < 10; i++) {
                        Map<String, Object> ask = new HashMap<>();
                        ask.put("price", fields[3 + i]);
                        ask.put("volume", fields[23 + i]);
                        askPrices.add(ask);
                    }

                    // 매수 호가 (BIDP1~10: index 13~22, 잔량: index 33~42)
                    List<Map<String, Object>> bidPrices = new ArrayList<>();
                    for (int i = 0; i < 10; i++) {
                        Map<String, Object> bid = new HashMap<>();
                        bid.put("price", fields[13 + i]);
                        bid.put("volume", fields[33 + i]);
                        bidPrices.add(bid);
                    }

                    orderBook.put("askPrices", askPrices);
                    orderBook.put("bidPrices", bidPrices);

                    messagingTemplate.convertAndSend("/topic/orderbook", objectMapper.writeValueAsString(orderBook));
                } catch (Exception e) {
                    log.error("메시지 처리 오류", e);
                }
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                log.error("KIS WebSocket 오류: {}", t.getMessage());
                reconnect();
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                log.info("KIS WebSocket 종료: {}", reason);
            }
        });
    }

    public void subscribe(String stockCode) {
        String approvalKey= kisTokenService.getApprovalKey();

        Map<String, Object> body=new HashMap<>();
        body.put("header", Map.of(
           "approval_key", approvalKey,
           "custtype", "P",
           "tr_type", "1",
           "content-type", "utf-8"
        ));
        body.put("body", Map.of(
                "input", Map.of(
                        "tr_id", "H0STASP0",
                        "tr_key", stockCode
                )
        ));

        try {
            webSocket.send(objectMapper.writeValueAsString(body));
        } catch (Exception e){
            log.error("구독 요청 오류", e);
        }
    }

    public void unsubscribe(String stockCode){
        String approvalKey= kisTokenService.getApprovalKey();

        Map<String, Object> body = new HashMap<>();
        body.put("header", Map.of(
                "approval_key", approvalKey,
                "custtype", "P",
                "tr_type", "2",  // 2가 구독 해제
                "content-type", "utf-8"
        ));
        body.put("body", Map.of(
                "input", Map.of(
                        "tr_id", "H0STASP0",
                        "tr_key", stockCode
                )
        ));

        try {
            webSocket.send(objectMapper.writeValueAsString(body));
        } catch (Exception e) {
            log.error("구독 해제 오류", e);
        }
    }

    private void reconnect(){
        log.info("KIS WebSocket 재연결 시도...");

        try {
            Thread.sleep(5000);
            connect();
        } catch (InterruptedException e){
            Thread.currentThread().interrupt();
        }
    }

    @PreDestroy
    public void disconnect(){
        if (webSocket != null){
            webSocket.close(1000, "서버 종료");
        }

        if (client != null){
            client.dispatcher().executorService().shutdown();
        }
    }
}
