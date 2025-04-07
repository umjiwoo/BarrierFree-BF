package com.blindfintech.domain.transaction.dto;

import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.transaction.entity.TransactionHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RecentTransactionAccountDto {
    private Integer receiverAccountId;
    private String receiverAccount;
    private String receiverName;
    private LocalDateTime transactionDate;

    public static RecentTransactionAccountDto of(TransactionHistory transactionHistory, Account account) {
        return RecentTransactionAccountDto.builder()
                .receiverAccountId(account.getId())
                .receiverAccount(transactionHistory.getTransactionAccount())
                .receiverName(transactionHistory.getTransactionName())
                .transactionDate(transactionHistory.getLastTransaction())
                .build();
    }
}
