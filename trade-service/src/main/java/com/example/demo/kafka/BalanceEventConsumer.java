package com.example.demo.kafka;

import com.example.demo.kafka.event.BalanceResponseEvent;
import com.example.demo.kafka.event.TradeCompletedEvent;
import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import com.example.demo.redis.dto.OrderBook;
import com.example.demo.sse.SseEmitterService;
import com.example.demo.trade.entity.Trades;
import com.example.demo.trade.repository.TradesRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

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

    private static final String MATCH_KEY = "order:match:%d";
    private static final String LOCK_KEY = "order:lock:%d";
    private static final String DONE_KEY = "order:ioc:done:%d";

    @KafkaListener(topics = "balance.trade.success", groupId = "trade-service")
    public void handleBalanceDeducted(BalanceResponseEvent event){
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

        OrderBook buyOrderBook=orderBookRepository.getOrderBook(buyOrderId);

        //매수/매도 주문 각각 처리
        processOrder(buyOrder, buyOrderBook, filledQuantity);
        processOrder(sellOrder, sellOrderBook, filledQuantity);

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
                .build());

    }

    @KafkaListener(topics = "balance.trade.error", groupId = "trade-service")
    public void handleBalanceError(BalanceResponseEvent event){
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
            } else {
                orderBookRepository.updateQuantity(orderId, remaining);
                order.setStatus(Status.PARTIALLY_FILLED);
            }
        } else if (condition == OrderCondition.FOK) {
            orderBookRepository.removeOrder(order);
            order.setStatus(Status.FILLED);
        } else if (condition == OrderCondition.IOC) {
            String doneKey=String.format(DONE_KEY, orderId);
            boolean isLast="true".equals(redisTemplate.opsForValue().get(doneKey));
            long remaining=orderBook.getRemainingQuantity() - filledQuantity;

            if (isLast){
                orderBookRepository.removeOrder(order);
                order.setStatus(Status.FILLED);
                redisTemplate.delete(doneKey);
            } else {
                orderBookRepository.updateQuantity(orderId, remaining);
                order.setStatus(Status.PARTIALLY_FILLED);
            }
        }

        ordersRepository.save(order);
    }
}
