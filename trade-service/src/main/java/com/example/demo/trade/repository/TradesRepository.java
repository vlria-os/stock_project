package com.example.demo.trade.repository;

import com.example.demo.trade.entity.Trades;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradesRepository extends JpaRepository<Trades, Long> {
}
