package com.example.demo.repository;

import com.example.demo.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository <Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);

    Optional<Wishlist> findByUserIdAndStockCode(Long userId, String stockCode);

    Boolean existsByUserIdAndStockCode(Long userId, String stockCode);

    void deleteByUserIdAndStockCode(Long userId, String stockCode);
}
