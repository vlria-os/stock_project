package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stocks")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false, length = 20)
    private String code;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(length = 20)
    private String market;

//    DECIMAL(15,2) 전체 15자리 소수점 2자리
    @Column(name = "current_price", precision = 15, scale = 2)
    private BigDecimal currentPrice;
    @Column(name = "prev_price", precision = 15, scale = 2)
    private BigDecimal prevPrice;
    private Long volume;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // 스케줄러가 KIS API로 현재가 업데이트할 때 사용
    public void updatePrice(BigDecimal currentPrice, BigDecimal prevPrice, Long volume){
        this.currentPrice = currentPrice;
        this.prevPrice = prevPrice;
        this.volume = volume;
        this.updatedAt = LocalDateTime.now();
    }
}
