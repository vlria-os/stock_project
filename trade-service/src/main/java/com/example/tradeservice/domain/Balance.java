package com.example.tradeservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Balance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long balanceId;
    private Long userId;
    private Long balance;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    //생성 팩토리
    public static  Balance create(Long userId){
        return Balance.builder()
                .userId(userId)
                .balance(0L)
                .build();
    }

    public void deposit(Long amount){
        this.balance+=amount;
    }

    public void withdraw(Long amount) {
        if (this.balance < amount) {
            throw new IllegalStateException("잔고 부족");
        }
        this.balance -= amount;
    }
}
