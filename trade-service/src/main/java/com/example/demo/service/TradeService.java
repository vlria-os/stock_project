package com.example.demo.service;

import com.example.demo.client.BalanceClient;
import com.example.demo.client.StockClient;
import com.example.demo.client.dto.BalanceOrderRequest;
import com.example.demo.client.dto.BalanceOrderResponse;
import com.example.demo.client.dto.TradeRequest;
import com.example.demo.order.dto.OrderHistoryResponse;
import com.example.demo.order.entity.OrderHistory;
import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.OrderType;
import com.example.demo.order.enums.Side;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrderHistoryRepository;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import com.example.demo.redis.dto.OrderBook;
import com.example.demo.trade.dto.HoldingsResponse;
import com.example.demo.trade.dto.TradeHistoryResponse;
import com.example.demo.trade.repository.TradeHistoryRepository;
import com.example.demo.trade.repository.TradesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final OrdersRepository ordersRepository;
    private final OrderBookRepository orderBookRepository;
    private final OrderMatchingEngine orderMatchingEngine;
    private final BalanceClient balanceClient;
    private final TradesRepository tradesRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final TradeHistoryRepository tradeHistoryRepository;
    private final StockClient stockClient;

    @Transactional
    public void placeOrder(Long userId, TradeRequest request){
        System.out.println("orderType: " + request.getOrderType());
        System.out.println("orderCondition: " + request.getOrderCondition());
        System.out.println("조건: " + (request.getOrderType() != OrderType.LIMIT && request.getOrderCondition() != OrderCondition.GTC));

        //시장가 + GTC 조합 검즙
        if (request.getOrderType() == OrderType.MARKET && request.getOrderCondition() == OrderCondition.GTC){
            throw new IllegalArgumentException("시장가 주문은 GTC를 지원하지 않습니다.");
        }

        if (request.getSide() == Side.BUY){
            //매수 -> 호가창 조회
            List<OrderBook> sellOrders=(request.getOrderType() == OrderType.MARKET)
                    ? orderBookRepository.getSellOrdersForMarket(request.getStockCode())
                    : orderBookRepository.getSellOrdersAtOrBelow(request.getStockCode(), request.getPrice());

            //지정가 GTC를 제외하고 호가창 비어있을 때 예외
            if ((request.getOrderType() != OrderType.LIMIT && request.getOrderCondition() != OrderCondition.GTC)
                    && (sellOrders == null || sellOrders.isEmpty())){
                throw new IllegalArgumentException("체결 가능한 매도 주문이 없습니다.");
            }

            //FOK -> 전량 체결 가능한지 확인
            if (request.getOrderCondition() == OrderCondition.FOK){
                long totalAvailable=sellOrders.stream()
                        .mapToLong(OrderBook::getRemainingQuantity).sum();

                if (totalAvailable < request.getQuantity()){
                    throw new IllegalArgumentException("전량 체결이 불가합니다.");
                }
            }

            //계좌 잔고 확인
            long amount=0;
            long remainingQuantity=request.getQuantity();

            if (request.getOrderType() == OrderType.LIMIT){
                amount=request.getPrice() * request.getQuantity();
            } else {
                for (OrderBook sellOrder:sellOrders){
                    if (remainingQuantity <= 0) break;

                    long executableQuantity=Math.min(remainingQuantity, sellOrder.getRemainingQuantity());
                    amount += executableQuantity * sellOrder.getPrice();
                    remainingQuantity -= executableQuantity;
                }
            }

            //잔고 확인
            Long balance=balanceClient.orderBalance(userId);

            if (amount > balance){
                throw new IllegalArgumentException("잔고가 부족합니다.");
            }
        } else {
            //매도 -> 보유 주식 수량 확인
            Long purchased=tradesRepository.sumPurchasedQuantity(userId, request.getStockCode());
            Long sold=tradesRepository.sumSoldQuantity(userId, request.getStockCode());

            long holdingQuantity=(purchased == null ? 0 : purchased) - (sold == null ? 0 : sold);

            if (holdingQuantity < request.getQuantity()){
                throw new IllegalArgumentException("보유 주식 수량이 부족합니다.");
            }

            //호가창 조회
            List<OrderBook> buyOrders=(request.getOrderType() == OrderType.MARKET)
                    ? orderBookRepository.getBuyOrdersForMarket(request.getStockCode())
                    : orderBookRepository.getBuyOrdersAtOrAbove(request.getStockCode(), request.getPrice());

            //지정가 GTC를 제외하고 호가창 비어있을 때 예외
            if (!(request.getOrderType() == OrderType.LIMIT && request.getOrderCondition() == OrderCondition.GTC)
                    && (buyOrders == null || buyOrders.isEmpty())){
                throw new IllegalArgumentException("체결 가능한 매수 주문이 없습니다.");
            }

            if (request.getOrderCondition() == OrderCondition.FOK){
                long totalAvailable=buyOrders.stream()
                        .mapToLong(OrderBook::getRemainingQuantity).sum();

                if (totalAvailable < request.getQuantity()){
                    throw new IllegalArgumentException("전량 체결이 불가합니다.");
                }
            }
        }

        //주문 insert
        Orders order=Orders.builder()
                .userId(userId)
                .stockCode(request.getStockCode())
                .side(request.getSide())
                .orderType(request.getOrderType())
                .orderCondition(request.getOrderCondition())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .status(Status.PENDING)
                .expiredAt(request.getExpiredAt() != null ? request.getExpiredAt() : null)
                .build();

        ordersRepository.save(order);

        //주문 내역 insert
        OrderHistory history=OrderHistory.builder()
                .userId(order.getUserId())
                .stockCode(order.getStockCode())
                .orderType(order.getOrderType())
                .orderCondition(order.getOrderCondition())
                .side(order.getSide())
                .price(order.getPrice())
                .quantity(order.getQuantity())
                .filledQuantity(0L)
                .remainingQuantity(order.getQuantity())
                .status(order.getStatus())
                .build();

        orderHistoryRepository.save(history);

        //redis 호가창에 등록
        orderBookRepository.addOrder(order);

        //체결 엔진 호출
        orderMatchingEngine.match(order);
    }

    @Transactional
    public Long cancelOrder(Long orderId, Long userId){
        Orders order=ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문 번호입니다."));

        if (!userId.equals(order.getUserId())){
            throw new IllegalArgumentException("주문을 취소할 권한이 없습니다!");
        }

        if (order.getOrderCondition() != OrderCondition.GTC && order.getStatus() != Status.PENDING){
            throw new IllegalArgumentException("취소할 수 없는 주문입니다.");
        }

        orderBookRepository.removeOrder(order);

        order.setStatus(Status.CANCELLED);
        ordersRepository.save(order);

        orderHistoryRepository.save(OrderHistory.builder()
                .userId(order.getUserId())
                .stockCode(order.getStockCode())
                .orderType(order.getOrderType())
                .orderCondition(order.getOrderCondition())
                .side(order.getSide())
                .price(order.getPrice())
                .quantity(order.getQuantity())
                .filledQuantity(0L)
                .remainingQuantity(order.getQuantity())
                .status(order.getStatus())
                .build());

        return orderId;
    }

    public Page<OrderHistoryResponse> getMyOrderHistory(Long userId, Status status, Pageable pageable){
        Page<OrderHistoryResponse> histories=orderHistoryRepository.findMyOrders(userId, status, pageable);

        List<OrderHistoryResponse> contents=histories.getContent();
        for (OrderHistoryResponse history:contents){
            history.setStockName(stockClient.getStockName(history.getStockCode()));
        }

        return histories;
    }

    public Page<TradeHistoryResponse> getMyTradeHistory(Long userId, Pageable pageable){
        Page<TradeHistoryResponse> histories=tradeHistoryRepository.findByUserId(userId, pageable);

        List<TradeHistoryResponse> contents=histories.getContent();
        for (TradeHistoryResponse history:contents){
            history.setStockName(stockClient.getStockName(history.getStockCode()));
        }

        return histories;
    }

    public Page<HoldingsResponse> getMyHoldings(Long userId, Pageable pageable){
        Page<HoldingsResponse> holdings=tradesRepository.myHoldings(userId, pageable);

        List<HoldingsResponse> contents=holdings.getContent();
        for (HoldingsResponse content:contents){
            content.setStockName(stockClient.getStockName(content.getStockCode()));
        }

        return holdings;
    }
}
