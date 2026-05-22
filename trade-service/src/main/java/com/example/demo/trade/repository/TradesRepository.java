package com.example.demo.trade.repository;

import com.example.demo.order.enums.Side;
import com.example.demo.trade.entity.Trades;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TradesRepository extends JpaRepository<Trades, Long> {
    @Query("""
        select sum(t.filledQuantity)
        from Trades t
        where t.buyOrder.userId = :userId
            and t.stockCode = :stockCode
    """)
    Long sumPurchasedQuantity(@Param("userId") Long userId, @Param("stockCode") String stockCode);

    @Query("""
        select sum(t.filledQuantity)
        from Trades t
        where t.sellOrder.userId = :userId
            and t.stockCode = :stockCode
    """)
    Long sumSoldQuantity(@Param("userId") Long userId, @Param("stockCode") String stockCode);
}


