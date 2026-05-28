package com.example.balanceservice.service;

import com.example.balanceservice.controller.BalanceKafkaProducer;
import com.example.balanceservice.domain.Balance;
import com.example.balanceservice.domain.BalanceHistory;
import com.example.balanceservice.domain.BalanceType;
import com.example.balanceservice.domain.LinkedBalance;
import com.example.balanceservice.repository.BalanceHistoryRepository;
import com.example.balanceservice.repository.BalanceRepository;
import com.example.balanceservice.repository.LInkedBalanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Transactional
public class BalanceService {
    private final RedisTemplate<Object, Object> redisTemplate;
    private final BalanceRepository balanceRepository;
    private final BalanceHistoryRepository balanceHistoryRepository;
    private final BalanceKafkaProducer kafkaProducer;

    private static final long LOCK_TTL = 3L;
    private static final long IDEMPOTENCY_TTL = 60 * 60 * 24L;
    private final LInkedBalanceRepository lInkedBalanceRepository;

    private boolean tryLock(Long userId) {
        String key = "lock:balance:" + userId;
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(key, "locked", LOCK_TTL, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(acquired);
    }

    private void unlock(Long userId) {
        redisTemplate.delete("lock:balance:" + userId);
    }

    private boolean isDuplicate(Long idempotencyKey) {
        String key = "idempotency:" + idempotencyKey;
        Boolean isNew = redisTemplate.opsForValue()
                .setIfAbsent(key, "processed", IDEMPOTENCY_TTL, TimeUnit.SECONDS);
        return !Boolean.TRUE.equals(isNew);
    }

    // 잔고 조회
    public Long getBalance(Long userId) {
        Balance balance = balanceRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));
        return balance.getBalance();
    }

    // 충전
    public void deposit(Long userId, Long amount, Long idempotencyKey, Long linkedBalanceId) {
        if (isDuplicate(idempotencyKey)) throw new IllegalStateException("중복 요청");
        if (!tryLock(userId)) throw new IllegalStateException("잠시 후 다시 시도해주세요");
        try {
            Balance balance = balanceRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));
            LinkedBalance linkedBalance = lInkedBalanceRepository.findById(linkedBalanceId)
                    .orElseThrow(() -> new IllegalArgumentException("연결 계좌 없음"));
            balance.deposit(amount);
            balanceHistoryRepository.save(BalanceHistory.builder()
                    .userId(userId)
                    .type(BalanceType.DEPOSIT)
                    .amount(amount)
                    .balanceAfter(balance.getBalance())
                    .linkedBalance(linkedBalance)
                    .build());
        } finally {
            unlock(userId);
        }
    }

    // 출금
    public void withdraw(Long userId, Long amount, Long idempotencyKey, Long linkedBalanceId) {
        if (isDuplicate(idempotencyKey)) throw new IllegalStateException("중복 요청");
        if (!tryLock(userId)) throw new IllegalStateException("잠시 후 다시 시도해주세요");
        try {
            Balance balance = balanceRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));
            LinkedBalance linkedBalance = lInkedBalanceRepository.findById(linkedBalanceId)
                    .orElseThrow(() -> new IllegalArgumentException("연결 계좌 없음"));
            balance.withdraw(amount);
            balanceHistoryRepository.save(BalanceHistory.builder()
                    .userId(userId)
                    .type(BalanceType.WITHDRAW)
                    .amount(amount)
                    .balanceAfter(balance.getBalance())
                    .linkedBalance(linkedBalance)
                    .build());
        } finally {
            unlock(userId);
        }
    }

    // 체결 처리 (buyer 차감 + seller 증가)
    public void executeTrade(Long buyOrderId, Long buyerId, Long sellerId, Long amount) {
        if (isDuplicate(buyOrderId)) throw new IllegalStateException("중복 요청");

        Long firstId = Math.min(buyerId, sellerId);
        Long secondId = Math.max(buyerId, sellerId);

        if (!tryLock(firstId)) throw new IllegalStateException("잠시 후 다시 시도해주세요");
        if (!tryLock(secondId)) {
            unlock(firstId);
            throw new IllegalStateException("잠시 후 다시 시도해주세요");
        }

        try {
            Balance buyer = balanceRepository.findByUserId(buyerId)
                    .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));
            Balance seller = balanceRepository.findByUserId(sellerId)
                    .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));

            try {
                buyer.withdrawLocked(amount);
                seller.deposit(amount);

                balanceHistoryRepository.save(BalanceHistory.builder()
                        .userId(buyerId).type(BalanceType.BUY_CONFIRM)
                        .amount(amount).balanceAfter(buyer.getBalance()).build());
                balanceHistoryRepository.save(BalanceHistory.builder()
                        .userId(sellerId).type(BalanceType.SELL_CONFIRM)
                        .amount(amount).balanceAfter(seller.getBalance()).build());

                // 성공 발행
                kafkaProducer.sendTradeResult(buyOrderId, buyerId, sellerId, amount, true);

            } catch (Exception e) {
                balanceHistoryRepository.save(BalanceHistory.builder()
                        .userId(buyerId).type(BalanceType.BUY_FAIL)
                        .amount(amount).balanceAfter(buyer.getBalance()).build());
                balanceHistoryRepository.save(BalanceHistory.builder()
                        .userId(sellerId).type(BalanceType.SELL_FAIL)
                        .amount(amount).balanceAfter(seller.getBalance()).build());

                // 실패 발행
                kafkaProducer.sendTradeResult(buyOrderId, buyerId, sellerId, amount, false);
                throw e;
            }
        } finally {
            unlock(firstId);
            unlock(secondId);
        }
    }

    // 락 걸기
    public void lockBalance(Long userId, Long amount, Long idempotencyKey) {
        if (isDuplicate(idempotencyKey)) throw new IllegalStateException("중복 요청");
        if (!tryLock(userId)) throw new IllegalStateException("잠시 후 다시 시도해주세요");
        try {
            Balance balance = balanceRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));
            balance.lockBalance(amount);
            balanceHistoryRepository.save(BalanceHistory.builder()
                    .userId(userId)
                    .type(BalanceType.LOCK)
                    .amount(amount)
                    .balanceAfter(balance.getBalance())
                    .build());
        } finally {
            unlock(userId);
        }
    }

    // 락 해제 (주문 취소)
    public void unlockBalance(Long userId, Long amount, Long idempotencyKey) {
        if (isDuplicate(idempotencyKey)) throw new IllegalStateException("중복 요청");
        if (!tryLock(userId)) throw new IllegalStateException("잠시 후 다시 시도해주세요");
        try {
            Balance balance = balanceRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("계좌 없음"));
            balance.unlockBalance(amount);
            balanceHistoryRepository.save(BalanceHistory.builder()
                    .userId(userId)
                    .type(BalanceType.UNLOCK)
                    .amount(amount)
                    .balanceAfter(balance.getBalance())
                    .build());
        } finally {
            unlock(userId);
        }
    }

    public List<BalanceHistory> getHistory(Long userId) {
        return balanceHistoryRepository.findByUserIdOrderByCreateAtDesc(userId);
    }
}
