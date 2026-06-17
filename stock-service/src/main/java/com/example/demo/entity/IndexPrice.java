package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "index_prices")
public class IndexPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "index_code", unique = true, nullable = false, length = 20)
    private String indexCode;

    @Column(name = "current_price", length = 50)
    private String currentPrice;

    @Column(name = "price_change", length = 50)
    private String priceChange;

    @Column(name = "change_rate", length = 50)
    private String changeRate;

    @Column(name = "sign", length = 10)
    private String sign;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(String currentPrice, String priceChange, String changeRate, String sign) {
        this.currentPrice = currentPrice;
        this.priceChange = priceChange;
        this.changeRate = changeRate;
        this.sign = sign;
        this.updatedAt = LocalDateTime.now();
    }
}