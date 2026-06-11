package com.example.demo.trade.repository;

import com.example.demo.trade.dto.TradeHistoryResponse;
import com.example.demo.trade.entity.TradeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TradeHistoryRepository extends JpaRepository<TradeHistory, Long> {
    @Query("""
        select t
        from TradeHistory t
        where t.userId = :userId
            and (:orderId is null or t.order.id = :orderId)
                and (:stockCode is null or t.stockCode = :stockCode)
    """)
    Page<TradeHistory> findByUserId(@Param("userId") Long userId, @Param("orderId") Long orderId,
                                    @Param("stockCode") String stockCode, Pageable pageable);
}
