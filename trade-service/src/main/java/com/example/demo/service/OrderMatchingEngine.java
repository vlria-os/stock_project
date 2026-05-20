package com.example.demo.service;

import com.example.demo.kafka.TradeEventProducer;
import com.example.demo.kafka.event.BalanceRequestEvent;
import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import com.example.demo.redis.dto.OrderBook;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.Order;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMatchingEngine {
    private final OrderBookRepository orderBookRepository;
    private final RedissonClient redissonClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final TradeEventProducer tradeEventProducer;
    private final OrdersRepository ordersRepository;

    private static final String LOCK_KEY="order:lock:%d";
    private static final String MATCH_KEY="order:match:%d";
    private static final String DONE_KEY="order:ioc:done:%d";

    public void match(Orders order){
        if (order.getSide() == Side.BUY){
            matchBuy(order);
        } else {
            matchSell(order);
        }
    }

    private void matchBuy(Orders order){
        switch (order.getOrderCondition()) {
            case GTC -> matchGTCBuy(order);
            case FOK -> matchFOKBuy(order);
            case IOC -> matchIOCBuy(order);
        }
    }

    private void matchSell(Orders order){
        switch (order.getOrderCondition()){
            case GTC -> matchGTCSell(order);
            case FOK -> matchFOKSell(order);
            case IOC -> matchIOCSell(order);
        }
    }

    //GTC
    private void matchGTCBuy(Orders order){
        RLock myLock=redissonClient.getLock(String.format(LOCK_KEY, order.getId()));
        myLock.lock();

        List<OrderBook> sellOrders=getSellOrders(order);
        if (sellOrders == null || sellOrders.isEmpty()){
            myLock.unlock();
            return;
        }

        executeMatchLoop(order, sellOrders);
    }

    private void matchGTCSell(Orders order){
        RLock myLock=redissonClient.getLock(String.format(LOCK_KEY, order.getId()));
        myLock.lock();

        List<OrderBook> buyOrders=getBuyOrders(order);
        if (buyOrders == null || buyOrders.isEmpty()){
            myLock.unlock();
            return;
        }

        executeMatchLoop(order, buyOrders);
    }

    //FOK
    private void matchFOKBuy(Orders order){
        RLock myLock=redissonClient.getLock(String.format(LOCK_KEY, order.getId()));
        myLock.lock();

        List<OrderBook> sellOrders=getSellOrders(order);

        long totalAvailable=sellOrders.stream()
                .mapToLong(OrderBook::getRemainingQuantity).sum();

        if (totalAvailable < order.getQuantity()){
            order.setStatus(Status.CANCELLED);
            ordersRepository.save(order);
            orderBookRepository.removeOrder(order);
            myLock.unlock();
            return;
        }

        executeMatchLoop(order, sellOrders);
    }

    private void matchFOKSell(Orders order){
        RLock myLock=redissonClient.getLock(String.format(LOCK_KEY, order.getId()));
        myLock.lock();

        List<OrderBook> buyOrders=getBuyOrders(order);

        long totalAvailable=buyOrders.stream()
                .mapToLong(OrderBook::getRemainingQuantity).sum();

        if (totalAvailable < order.getQuantity()){
            order.setStatus(Status.CANCELLED);
            ordersRepository.save(order);
            orderBookRepository.removeOrder(order);
            myLock.unlock();
            return;
        }

        executeMatchLoop(order, buyOrders);
    }

    //IOC
    private void matchIOCBuy(Orders order){
        RLock myLock=redissonClient.getLock(String.format(LOCK_KEY, order.getId()));
        myLock.lock();

        List<OrderBook> sellOrders=getSellOrders(order);
        if (sellOrders == null || sellOrders.isEmpty()){
            order.setStatus(Status.CANCELLED);
            ordersRepository.save(order);
            orderBookRepository.removeOrder(order);
            myLock.unlock();
            return;
        }

        executeMatchLoop(order, sellOrders);
    }

    private void matchIOCSell(Orders order){
        RLock myLock=redissonClient.getLock(String.format(LOCK_KEY, order.getId()));
        myLock.lock();

        List<OrderBook> buyOrders=getBuyOrders(order);
        if (buyOrders == null || buyOrders.isEmpty()){
            order.setStatus(Status.CANCELLED);
            ordersRepository.save(order);
            orderBookRepository.removeOrder(order);
            myLock.unlock();
            return;
        }

        executeMatchLoop(order, buyOrders);
    }

    //=========================공통 체결 루프==========================//
    private void executeMatchLoop(Orders order, List<OrderBook> counterOrders){
        //주문 수량
        long remainingQuantity=order.getQuantity();

        //체결 가능한 상대 주문 수량의 합
        long counterTotalQuantity=0;

        //실제로 주문이 체결될 상대 주문 리스트
        List<OrderBook> lockedOrders=new ArrayList<>();

        //1단계: lock 걸고 주문 수량 합산 + 매핑 저장
        for(OrderBook counterOrder:counterOrders){
            RLock counterLock=redissonClient.getLock(String.format(LOCK_KEY, counterOrder.getOrderId()));
            counterLock.lock();

            OrderBook fresh=orderBookRepository.getOrderBook(counterOrder.getOrderId());
            if (fresh == null){
                counterLock.forceUnlock();
                continue;
            }

            Long buyOrderId=(order.getSide() == Side.BUY) ? order.getId() : fresh.getOrderId();
            Long sellOrderId=(order.getSide() == Side.BUY) ? fresh.getOrderId() : order.getId();

            //redis에 매핑 저장
            redisTemplate.opsForValue().set(
                    String.format(MATCH_KEY, buyOrderId),
                    String.valueOf(sellOrderId)
            );

            lockedOrders.add(fresh);
            counterTotalQuantity += fresh.getRemainingQuantity();

            if (counterTotalQuantity >= remainingQuantity) break;
        }

        //2단계: 체결 루프
        for (OrderBook fresh:lockedOrders){
            if (remainingQuantity <= 0) break;

            Long buyOrderId=(order.getSide() == Side.BUY) ? order.getId() : fresh.getOrderId();

            long executableQuantity=Math.min(remainingQuantity, fresh.getRemainingQuantity());
            long amount=executableQuantity * fresh.getPrice();

            remainingQuantity -= executableQuantity;
            counterTotalQuantity -= fresh.getRemainingQuantity();

            //IOC 주문일 때 마지막 신호 저장
            if (order.getOrderCondition() == OrderCondition.IOC &&
                    (counterTotalQuantity == 0 || remainingQuantity == 0)){
                redisTemplate.opsForValue().set(
                        String.format(DONE_KEY, order.getId()),
                        "true"
                );
            }

            //kafka 발행
            tradeEventProducer.sendBalanceRequest(BalanceRequestEvent.builder()
                    .buyOrderId(buyOrderId)
                    .buyerId((order.getSide() == Side.BUY) ? order.getUserId() : fresh.getUserId())
                    .sellerId((order.getSide() == Side.BUY) ? fresh.getUserId() : order.getUserId())
                    .amount(amount)
                    .build());
        }
    }

    //=====================호가창 조회 헬퍼============================//

    //매도 호가창
    private List<OrderBook> getSellOrders(Orders order){
        return (order.getOrderType() == OrderType.MARKET)
                ? orderBookRepository.getSellOrdersForMarket(order.getStockCode())
                : orderBookRepository.getSellOrdersAtOrBelow(order.getStockCode(), order.getPrice());
    }

    //매수 호가창
    private List<OrderBook> getBuyOrders(Orders order){
        return (order.getOrderType() == OrderType.MARKET)
                ? orderBookRepository.getBuyOrdersForMarket(order.getStockCode())
                : orderBookRepository.getBuyOrdersAtOrAbove(order.getStockCode(), order.getPrice());
    }
}
