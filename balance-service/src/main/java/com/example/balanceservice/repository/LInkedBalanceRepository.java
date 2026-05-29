package com.example.balanceservice.repository;

import com.example.balanceservice.domain.LinkedBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LInkedBalanceRepository extends JpaRepository<LinkedBalance, Long> {
    List<LinkedBalance> findByUserId(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
