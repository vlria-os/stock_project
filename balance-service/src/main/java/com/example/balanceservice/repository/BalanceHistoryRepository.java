package com.example.balanceservice.repository;

import com.example.balanceservice.domain.BalanceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BalanceHistoryRepository extends JpaRepository<BalanceHistory, Long> {
    List<BalanceHistory> findByUserIdOrderByCreateAtDesc(Long userId);
}
