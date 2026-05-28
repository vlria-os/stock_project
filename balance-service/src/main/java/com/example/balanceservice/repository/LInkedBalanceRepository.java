package com.example.balanceservice.repository;

import com.example.balanceservice.domain.LinkedBalance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LInkedBalanceRepository extends JpaRepository<LinkedBalance, Long> {
}
