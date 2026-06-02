package com.example.balanceservice.service;

import com.example.balanceservice.domain.LinkedBalance;
import com.example.balanceservice.repository.LInkedBalanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LinkedBalanceService {
    private final LInkedBalanceRepository linkedBalanceRepository;

    public List<LinkedBalance> getLinkedBalances(Long userId) {
        return linkedBalanceRepository.findByUserId(userId);
    }

    public void addLinkedBalance(Long userId, String bankName, String accountNumber) {
        linkedBalanceRepository.save(LinkedBalance.builder()
                .userId(userId)
                .bankName(bankName)
                .accountNumber(accountNumber)
                .build());
    }

    public void deleteLinkedBalance(Long userId, Long linkedBalanceId) {
        linkedBalanceRepository.deleteByIdAndUserId(linkedBalanceId, userId);
    }
}
