package com.example.demo.service;

import com.example.demo.client.StockClient;
import com.example.demo.client.dto.Stock;
import com.example.demo.order.entity.OrderHistory;
import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrderHistoryRepository;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import com.example.demo.trade.repository.TradesRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderBookInitializer {
    private final OrdersRepository ordersRepository;
    private final OrderBookRepository orderBookRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final TradesRepository tradesRepository;
    private final StockClient stockClient;

    private static final Long SYSTEM_USER_ID = 14L;

    @PostConstruct
    public void init(){
        CompletableFuture.runAsync(this::initWithRetry);
    }

    private void initWithRetry(){
        int maxRetry=10;
        int delay=5000;

        for (int i=0; i<maxRetry; i++){
            try {
                List<Stock> stocks=stockClient.getStockList();
                initOrderBook(stocks);
                log.info("호가창 초기화 완료!");
                return;
            } catch (Exception e) {
                log.warn("Stock Service 응답 없음 - {}/{}회 재시도 중...", i + 1, maxRetry);
                try { Thread.sleep(delay); } catch (InterruptedException ignored) {}
            }
        }

        log.error("호가창 초기화 최종 실패 - 수동 개입 필요");
    }

    private void initOrderBook(List<Stock> stocks){
        //1. 시스템 계정의 PENDING + PARTIALLY_FILLED 주문 전부 취소
        List<Orders> systemOrders=ordersRepository
                .findByUserIdAndStatusIn(SYSTEM_USER_ID, List.of(Status.PENDING, Status.PARTIALLY_FILLED));

        systemOrders.forEach(order -> {
            Status newStatus = (order.getStatus() == Status.PARTIALLY_FILLED)
                    ? Status.PARTIALLY_CANCELLED
                    : Status.CANCELLED;

            long filledQuantity=tradesRepository.sumFilledQuantityByOrderId(order.getId());
            long remainingQuantity=order.getQuantity() - filledQuantity;

            order.setStatus(newStatus);
            orderBookRepository.removeOrder(order);

            orderHistoryRepository.save(OrderHistory.builder()
                    .userId(order.getUserId())
                    .stockCode(order.getStockCode())
                    .orderType(order.getOrderType())
                    .orderCondition(order.getOrderCondition())
                    .side(order.getSide())
                    .price(order.getPrice())
                    .quantity(order.getQuantity())
                    .filledQuantity(filledQuantity)
                    .remainingQuantity(remainingQuantity)
                    .status(newStatus)
                    .build());
        });

        ordersRepository.saveAll(systemOrders);

        //2. 사용자 계정의 PENDING + PARTIALLY_FILLED GTC 주문 Redis 호가창에 재적재
        List<Orders> userOrders=ordersRepository
                .findByStatusInAndOrderCondition(List.of(Status.PENDING, Status.PARTIALLY_FILLED), OrderCondition.GTC);

        for (Orders order : userOrders) {
            if (!order.getUserId().equals(SYSTEM_USER_ID)) {
                orderBookRepository.addOrder(order);

                if (order.getStatus() == Status.PARTIALLY_FILLED){
                    long filledQuantity=tradesRepository.sumFilledQuantityByOrderId(order.getId());
                    long remainingQuantity=order.getQuantity() - filledQuantity;

                    orderBookRepository.updateQuantity(order.getId(), remainingQuantity);
                }
            }
        }

        //3. 시스템 계정 매도 주문 생성
        for (Stock stock:stocks){
            if (stock.getRemainingShares() <= 0) continue;

            Orders systemOrder=Orders.builder()
                    .userId(SYSTEM_USER_ID)
                    .stockCode(stock.getCode())
                    .side(Side.SELL)
                    .orderType(OrderType.LIMIT)
                    .orderCondition(OrderCondition.GTC)
                    .price(stock.getListingPrice())
                    .quantity(stock.getRemainingShares())
                    .status(Status.PENDING).build();

            ordersRepository.save(systemOrder);
            orderBookRepository.addOrder(systemOrder);

            orderHistoryRepository.save(OrderHistory.builder()
                    .userId(SYSTEM_USER_ID)
                    .stockCode(stock.getCode())
                    .orderType(OrderType.LIMIT)
                    .orderCondition(OrderCondition.GTC)
                    .side(Side.SELL)
                    .price(stock.getListingPrice())
                    .quantity(stock.getRemainingShares())
                    .filledQuantity(0L)
                    .remainingQuantity(stock.getRemainingShares())
                    .status(Status.PENDING)
                    .build());
        }
    }
}
