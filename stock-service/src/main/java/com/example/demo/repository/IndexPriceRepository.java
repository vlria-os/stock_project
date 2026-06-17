package com.example.demo.repository;

import com.example.demo.entity.IndexPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IndexPriceRepository extends JpaRepository<IndexPrice, Long> {
    Optional<IndexPrice> findByIndexCode(String indexCode);
}