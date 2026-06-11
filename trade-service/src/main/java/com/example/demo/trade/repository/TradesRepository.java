package com.example.demo.trade.repository;

import com.example.demo.trade.dto.HoldingsResponse;
import com.example.demo.trade.entity.Trades;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("""
        select coalesce(sum(t.filledQuantity), 0)
        from Trades t
        where t.buyOrder.id = :orderId or t.sellOrder.id = :orderId
    """)
    Long sumFilledQuantityByOrderId(@Param("orderId") Long orderId);

    @Query(
        value = """
            select t.stockCode,
                sum(case
                        when t.buyOrder.userId = :userId then t.filledQuantity
                        when t.sellOrder.userId = :userId then -t.filledQuantity
                end) as holdings
            from Trades t
            where t.buyOrder.userId = :userId or t.sellOrder.userId = :userId
            group by t.stockCode
            having sum(case
                        when t.buyOrder.userId = :userId then t.filledQuantity
                        when t.sellOrder.userId = :userId then -t.filledQuantity
                end) > 0
        """,
        countQuery = """
            select count(distinct t.stockCode)
            from Trades t
            where t.buyOrder.userId = :userId or t.sellOrder.userId = :userId
        """
    )
    Page<Trades> myHoldings(@Param("userId") Long userId, Pageable pageable);
}


