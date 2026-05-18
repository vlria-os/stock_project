package com.example.demo.trade.repository;

import com.example.demo.trade.entity.TradeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradeHistoryRepository extends JpaRepository<TradeHistory, Long> {
    Page<TradeHistory> findByUserId(Long userId, Pageable pageable);
}
