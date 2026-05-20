package com.example.demo.kafka;

import com.example.demo.kafka.event.BalanceResponseEvent;
import com.example.demo.kafka.event.TradeCompletedEvent;
import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import com.example.demo.redis.dto.OrderBook;
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

    @KafkaListener(topics = "balance.trade.success", groupId = "trade-service")
    public void handleBalanceDeducted(BalanceResponseEvent event){
        Long buyOrderId=event.getBuyOrderId();

        //redis 매핑에서 sellOrderId 꺼내기
        String sellOrderIdStr=redisTemplate.opsForValue().get("order:match:" + buyOrderId);
        Long sellOrderId=Long.parseLong(sellOrderIdStr);

        //주문 조회
        Orders buyOrder=ordersRepository.findById(buyOrderId).orElseThrow();
        Orders sellOrder=ordersRepository.findById(sellOrderId).orElseThrow();

        //호가창에서 체결 수량 꺼내기
        OrderBook buyOrderBook=orderBookRepository.getOrderBook(buyOrderId);
        OrderBook sellOrderBook=orderBookRepository.getOrderBook(sellOrderId);

        long executableQuantity=Math.min(buyOrderBook.getRemainingQuantity(), sellOrderBook.getRemainingQuantity());

        //호가창 수정
        long buyRemaining=buyOrderBook.getRemainingQuantity() - executableQuantity;
        long sellRemaining=sellOrderBook.getRemainingQuantity() - executableQuantity;

        if (buyRemaining == 0){
            orderBookRepository.removeOrder(buyOrder);
        } else {
            orderBookRepository.updateQuantity(buyOrderId, buyRemaining);
        }

        if (sellRemaining == 0){
            orderBookRepository.removeOrder(sellOrder);
        } else {
            orderBookRepository.updateQuantity(sellOrderId, sellRemaining);
        }

        //체결 테이블 등록
        tradesRepository.save(Trades.builder()
                .buyOrder(buyOrder)
                .sellOrder(sellOrder)
                .stockCode(buyOrder.getStockCode())
                .filledQuantity(executableQuantity)
                .price(sellOrderBook.getPrice())
                .status(Status.FILLED)
                .build());

        //redis 매핑 삭제 + 락 해제
        redisTemplate.delete("order:match:" + buyOrderId);
        redissonClient.getLock("order:lock:" + buyOrderId).forceUnlock();
        redissonClient.getLock("order:lock:" + sellOrderId).forceUnlock();

        //stock 서비스에 체결 가격 전달
        tradeEventProducer.sendTradeResult(TradeCompletedEvent.builder()
                .stockCode(buyOrder.getStockCode())
                .price(sellOrderBook.getPrice()).build());
    }

    @KafkaListener(topics = "balance.trade.error", groupId = "trade-service")
    public void handleBalanceError(BalanceResponseEvent event){

    }
}
