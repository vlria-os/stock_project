package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "wishlists",
uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "stock_code"})) //중복방지
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "stock_code", nullable = false, length = 20)
    private String stockCode;

    @CreationTimestamp
    @Column(name = "create_at")
    private LocalDateTime createdAt;

}
