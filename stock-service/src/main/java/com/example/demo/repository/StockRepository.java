package com.example.demo.repository;

import com.example.demo.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT s.code FROM Stock s WHERE s.name = :name")
    Optional<String> findCodeByName(@Param("name") String name);
}