package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.transction.entity.TransactionHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RecentTransactionAccountDto {
    private String receiverAccount;
    private LocalDateTime transactionDate;

    public static RecentTransactionAccountDto of(TransactionHistory transactionHistory) {
        return RecentTransactionAccountDto.builder()
                .receiverAccount(transactionHistory.getTransactionAccount())
                .transactionDate(transactionHistory.getLastTransaction())
                .build();
    }
}
