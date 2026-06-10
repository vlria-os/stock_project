package com.example.demo.redis;

import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.Side;
import com.example.demo.redis.dto.OrderBook;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
@RequiredArgsConstructor
public class OrderBookRepository {
    private final RedisTemplate<String, String> redisTemplate;

    private  static final String BOOK_KEY="order:book:%s:%s";
    private static final String DETAIL_KEY="order:detail:%d";

    private String bookKey(String stockCode, Side side){
        return String.format(BOOK_KEY, stockCode, side.name());
    }

    private String detailKey(Long orderId){
        return String.format(DETAIL_KEY, orderId);
    }

    private double calcScore(Side side, Long price){
        double score=price.doubleValue();
        return (side == Side.BUY) ? -score : score;
    }

    private String toPaddedId(Long orderId){
        return String.format("%019d", orderId);
    }

    private Long fromPaddedId(String paddedId){
        return Long.parseLong(paddedId);
    }

    public void addOrder(Orders order){
        String bookKey=bookKey(order.getStockCode(), order.getSide());
        String detailKey=detailKey(order.getId());
        double score=calcScore(order.getSide(), order.getPrice());

        Map<String, String> map=new HashMap<>();
        map.put("orderId", String.valueOf(order.getId()));
        map.put("price", order.getPrice().toString());
        map.put("remainingQuantity", String.valueOf(order.getQuantity()));
        map.put("userId", String.valueOf(order.getUserId()));

        redisTemplate.executePipelined((RedisCallback<?>) connection -> {
            redisTemplate.opsForZSet().add(bookKey, toPaddedId(order.getId()), score);
            redisTemplate.opsForHash().putAll(detailKey, map);
            return null;
        });
    }

    public void removeOrder(Orders order){
        String bookKey=bookKey(order.getStockCode(), order.getSide());
        String detailKey=detailKey(order.getId());

        redisTemplate.executePipelined((RedisCallback<?>) connection -> {
            redisTemplate.opsForZSet().remove(bookKey, toPaddedId(order.getId()));
            redisTemplate.delete(detailKey);
            return null;
        });
    }

    public void updateQuantity(Long orderId, Long remainingQuantity){
        redisTemplate.opsForHash().put(detailKey(orderId), "remainingQuantity", String.valueOf(remainingQuantity));
    }

    private List<OrderBook> toOrderBooks(Set<String> paddedIds){
        if (paddedIds == null || paddedIds.isEmpty()) return Collections.emptyList();

        List<String> paddedIdList = new ArrayList<>(paddedIds);
        List<OrderBook> orderBooks = new ArrayList<>();

        for (String paddedId : paddedIdList) {
            Long orderId = fromPaddedId(paddedId);
            Map<Object, Object> map = redisTemplate.opsForHash().entries(detailKey(orderId));
            if (map == null || map.isEmpty()) continue;

            orderBooks.add(OrderBook.builder()
                    .orderId(orderId)
                    .userId(Long.parseLong((String) map.get("userId")))
                    .price(Long.parseLong((String) map.get("price")))
                    .remainingQuantity(Long.parseLong((String) map.get("remainingQuantity")))
                    .build());
        }

        return orderBooks;
    }

    //시장가 매수 -> 매도 호가창에서 낮은 가격 순으로 전부 꺼냄
    public List<OrderBook> getSellOrdersForMarket(String stockCode){
        Set<String> paddedIds=redisTemplate.opsForZSet()
                .range(bookKey(stockCode, Side.SELL), 0, -1);

        return toOrderBooks(paddedIds);
    }

    //시장가 매도 -> 매수 호가창에서 높은 가격 순으로 전부 꺼냄
    public List<OrderBook> getBuyOrdersForMarket(String stockCode){
        Set<String> paddedIds=redisTemplate.opsForZSet()
                .range(bookKey(stockCode, Side.BUY), 0, -1);

        return toOrderBooks(paddedIds);
    }

    //지정가 매수 -> 매도 호가창에서 지정가 이하 주문 꺼냄
    public List<OrderBook> getSellOrdersAtOrBelow(String stockCode, Long buyPrice){
        Set<String> paddedIds=redisTemplate.opsForZSet()
                .rangeByScore(bookKey(stockCode, Side.SELL), Double.NEGATIVE_INFINITY, buyPrice.doubleValue());

        return toOrderBooks(paddedIds);
    }

    //지정가 매도 -> 매수 호가창에서 지정가 이상 주문 꺼냄
    public List<OrderBook> getBuyOrdersAtOrAbove(String stockCode, Long sellPrice){
        Set<String> paddedIds=redisTemplate.opsForZSet()
                .rangeByScore(bookKey(stockCode, Side.BUY), Double.NEGATIVE_INFINITY, -sellPrice.doubleValue());

        return toOrderBooks(paddedIds);
    }

    //주문 단건 조회
    public OrderBook getOrderBook(Long orderId){
        Map<Object, Object> map=redisTemplate.opsForHash().entries(detailKey(orderId));
        if (map == null || map.isEmpty()) return null;

        return OrderBook.builder()
                .orderId(orderId)
                .price(Long.parseLong((String) map.get("price")))
                .remainingQuantity(Long.parseLong((String) map.get("remainingQuantity")))
                .userId(Long.parseLong((String) map.get("userId")))
                .build();
    }
}
