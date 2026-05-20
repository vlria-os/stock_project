package com.example.balanceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LockRequestDto {
    private Long userId;
    private Long amount;
    private Long idempotencyKey;
}
