package com.example.demo.kafka;

import com.example.demo.kafka.event.BalanceResponseEvent;
import com.example.demo.kafka.event.TradeCompletedEvent;
import com.example.demo.order.entity.OrderHistory;
import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrderHistoryRepository;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import com.example.demo.redis.dto.OrderBook;
import com.example.demo.sse.SseEmitterService;
import com.example.demo.trade.entity.TradeHistory;
import com.example.demo.trade.entity.Trades;
import com.example.demo.trade.repository.TradeHistoryRepository;
import com.example.demo.trade.repository.TradesRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.redisson.api.RedissonClient;
import com.fasterxml.jackson.databind.ObjectMapper; // 올바른 import

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class BalanceEventConsumer {
    private final RedisTemplate<String, String> redisTemplate;
    private final RedissonClient redissonClient;
    private final OrderBookRepository orderBookRepository;
    private final OrdersRepository ordersRepository;
    private final TradesRepository tradesRepository;
    private final TradeEventProducer tradeEventProducer;
    private final SseEmitterService sseEmitterService;
    private final OrderHistoryRepository orderHistoryRepository;
    private final TradeHistoryRepository tradeHistoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String MATCH_KEY = "order:match:%d";
    private static final String LOCK_KEY = "order:lock:%d";
    private static final String DONE_KEY = "order:ioc:done:%d";

    private static final Long SYSTEM_USER_ID = 14L;

    @KafkaListener(topics = "balance.trade.success", groupId = "trade-service",
            properties = {"value.deserializer=org.apache.kafka.common.serialization.StringDeserializer"})
    public void handleBalanceSuccess(String message) throws JsonProcessingException {
        BalanceResponseEvent event = objectMapper.readValue(message, BalanceResponseEvent.class);

        Long buyOrderId=event.getBuyOrderId();
        Long amount=event.getAmount();

        //redis 매핑에서 sellOrderId 꺼내기
        Long sellOrderId=Long.parseLong(
                redisTemplate.opsForValue().get(String.format(MATCH_KEY, buyOrderId))
        );

        //매수/매도 주문 DB 조회
        Orders buyOrder=ordersRepository.findById(buyOrderId).orElseThrow();
        Orders sellOrder=ordersRepository.findById(sellOrderId).orElseThrow();

        //체결 수량 계산
        OrderBook sellOrderBook=orderBookRepository.getOrderBook(sellOrderId);
        long price=sellOrderBook.getPrice();
        long filledQuantity=amount/price;

        //체결 테이블 insert
        tradesRepository.save(Trades.builder()
                .buyOrder(buyOrder)
                .sellOrder(sellOrder)
                .stockCode(buyOrder.getStockCode())
                .filledQuantity(filledQuantity)
                .price(price)
                .status(Status.FILLED)
                .build());

        //체결 내역 insert
        tradeHistoryRepository.save(TradeHistory.builder()
                .userId(buyOrder.getUserId())
                .stockCode(buyOrder.getStockCode())
                .side(buyOrder.getSide())
                .orderType(buyOrder.getOrderType())
                .orderCondition(buyOrder.getOrderCondition())
                .quantity(filledQuantity)
                .price(price)
                .totalAmount(filledQuantity * price)
                .build());

        tradeHistoryRepository.save(TradeHistory.builder()
                .userId(sellOrder.getUserId())
                .stockCode(sellOrder.getStockCode())
                .side(sellOrder.getSide())
                .orderType(sellOrder.getOrderType())
                .orderCondition(sellOrder.getOrderCondition())
                .quantity(filledQuantity)
                .price(price)
                .totalAmount(filledQuantity * price)
                .build());

        OrderBook buyOrderBook=orderBookRepository.getOrderBook(buyOrderId);

        //매수/매도 주문 각각 처리
        processOrder(buyOrder, buyOrderBook, filledQuantity);
        processOrder(sellOrder, sellOrderBook, filledQuantity);

        //주문 내역 insert
        long buyTotalFilled=tradesRepository.sumFilledQuantityByOrderId(buyOrderId);
        orderHistoryRepository.save(OrderHistory.builder()
                .userId(buyOrder.getUserId())
                .stockCode(buyOrder.getStockCode())
                .orderType(buyOrder.getOrderType())
                .orderCondition(buyOrder.getOrderCondition())
                .side(buyOrder.getSide())
                .price(buyOrder.getPrice())
                .quantity(buyOrder.getQuantity())
                .filledQuantity(buyTotalFilled)
                .remainingQuantity(buyOrder.getQuantity() - buyTotalFilled)
                .status(buyOrder.getStatus())
                .build());

        long sellTotalFilled= tradesRepository.sumFilledQuantityByOrderId(sellOrderId);
        orderHistoryRepository.save(OrderHistory.builder()
                .userId(sellOrder.getUserId())
                .stockCode(sellOrder.getStockCode())
                .orderType(sellOrder.getOrderType())
                .orderCondition(sellOrder.getOrderCondition())
                .side(sellOrder.getSide())
                .price(sellOrder.getPrice())
                .quantity(sellOrder.getQuantity())
                .filledQuantity(sellTotalFilled)
                .remainingQuantity(sellOrder.getQuantity() - sellTotalFilled)
                .status(sellOrder.getStatus())
                .build());

        //redis 매핑 삭제 + 락 해제
        redisTemplate.delete(String.format(MATCH_KEY, buyOrderId));
        redissonClient.getLock(String.format(LOCK_KEY, buyOrderId)).forceUnlock();
        redissonClient.getLock(String.format(LOCK_KEY, sellOrderId)).forceUnlock();

        //sse로 프론트에 체결 결과 전송
        sseEmitterService.sendTradeResult(buyOrder.getUserId(), filledQuantity, price);
        sseEmitterService.sendTradeResult(sellOrder.getUserId(), filledQuantity, price);

        //stock service에 kafka 발행
        tradeEventProducer.sendTradeResult(TradeCompletedEvent.builder()
                .stockCode(buyOrder.getStockCode())
                .price(price)
                .filledQuantity(filledQuantity)
                .isSystemSeller(sellOrder.getUserId().equals(SYSTEM_USER_ID))
                .build());

    }

    @KafkaListener(topics = "balance.trade.fail", groupId = "trade-service",
            properties = {"value.deserializer=org.apache.kafka.common.serialization.StringDeserializer"})
    public void handleBalanceError(String message) throws JsonProcessingException{
        BalanceResponseEvent event = objectMapper.readValue(message, BalanceResponseEvent.class);

        Long buyOrderId=event.getBuyOrderId();
        Long sellOrderId=Long.parseLong(
                redisTemplate.opsForValue().get(String.format(MATCH_KEY, buyOrderId))
        );

        Orders buyOrder=ordersRepository.findById(buyOrderId).orElseThrow();
        Orders sellOrder=ordersRepository.findById(sellOrderId).orElseThrow();

        orderBookRepository.removeOrder(buyOrder);
        orderBookRepository.removeOrder(sellOrder);

        buyOrder.setStatus(Status.FAILED);
        sellOrder.setStatus(Status.FAILED);
        ordersRepository.save(buyOrder);
        ordersRepository.save(sellOrder);

        //주문 내역 insert
        long buyTotalFilled=tradesRepository.sumFilledQuantityByOrderId(buyOrderId);
        orderHistoryRepository.save(OrderHistory.builder()
                .userId(buyOrder.getUserId())
                .stockCode(buyOrder.getStockCode())
                .orderType(buyOrder.getOrderType())
                .orderCondition(buyOrder.getOrderCondition())
                .side(buyOrder.getSide())
                .price(buyOrder.getPrice())
                .quantity(buyOrder.getQuantity())
                .filledQuantity(buyTotalFilled)
                .remainingQuantity(buyOrder.getQuantity() - buyTotalFilled)
                .status(buyOrder.getStatus())
                .build());

        long sellTotalFilled= tradesRepository.sumFilledQuantityByOrderId(sellOrderId);
        orderHistoryRepository.save(OrderHistory.builder()
                .userId(sellOrder.getUserId())
                .stockCode(sellOrder.getStockCode())
                .orderType(sellOrder.getOrderType())
                .orderCondition(sellOrder.getOrderCondition())
                .side(sellOrder.getSide())
                .price(sellOrder.getPrice())
                .quantity(sellOrder.getQuantity())
                .filledQuantity(sellTotalFilled)
                .remainingQuantity(sellOrder.getQuantity() - sellTotalFilled)
                .status(sellOrder.getStatus())
                .build());

        redisTemplate.delete(String.format(MATCH_KEY, buyOrderId));
        redissonClient.getLock(String.format(LOCK_KEY, buyOrderId)).forceUnlock();
        redissonClient.getLock(String.format(LOCK_KEY, sellOrderId)).forceUnlock();

        sseEmitterService.sendTradeError(buyOrder.getUserId(), buyOrderId);
        sseEmitterService.sendTradeError(sellOrder.getUserId(), sellOrderId);
    }

    private void processOrder(Orders order, OrderBook orderBook, long filledQuantity){
        Long orderId=order.getId();
        OrderCondition condition=order.getOrderCondition();

        if (condition == OrderCondition.GTC){
            long remaining=orderBook.getRemainingQuantity() - filledQuantity;
            if (remaining == 0){
                orderBookRepository.removeOrder(order);
                order.setStatus(Status.FILLED);
                order.setUpdatedAt(LocalDateTime.now());
            } else {
                orderBookRepository.updateQuantity(orderId, remaining);
                order.setStatus(Status.PARTIALLY_FILLED);
                order.setUpdatedAt(LocalDateTime.now());
            }
        } else if (condition == OrderCondition.FOK) {
            orderBookRepository.removeOrder(order);
            order.setStatus(Status.FILLED);
            order.setUpdatedAt(LocalDateTime.now());
        } else if (condition == OrderCondition.IOC) {
            String doneKey=String.format(DONE_KEY, orderId);
            boolean isLast="true".equals(redisTemplate.opsForValue().get(doneKey));
            long remaining=orderBook.getRemainingQuantity() - filledQuantity;

            if (isLast){
                orderBookRepository.removeOrder(order);

                if (order.getStatus() == Status.PARTIALLY_FILLED){
                    order.setStatus(Status.PARTIALLY_CANCELLED);
                    order.setUpdatedAt(LocalDateTime.now());
                } else {
                    order.setStatus(Status.FILLED);
                    order.setUpdatedAt(LocalDateTime.now());
                }

                redisTemplate.delete(doneKey);
            } else {
                orderBookRepository.updateQuantity(orderId, remaining);
                order.setStatus(Status.PARTIALLY_FILLED);
                order.setUpdatedAt(LocalDateTime.now());
            }
        }

        ordersRepository.save(order);
    }
}
