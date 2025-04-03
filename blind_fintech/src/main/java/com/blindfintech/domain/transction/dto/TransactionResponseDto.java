package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.accounts.entity.AccountTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Builder
public class TransactionResponseDto {
    private Integer id;
    private String transactionName;
    private Integer transactionAmount;
    private Long transactionBalance;
    private String transactionAccount;
    private Integer transactionBankId;
    private LocalDateTime transactionSuccessTime;

    public static TransactionResponseDto from(AccountTransaction accountTransaction) {
        return TransactionResponseDto.builder()
                .id(accountTransaction.getId())
                .transactionName(accountTransaction.getTransactionName())
                .transactionAmount(accountTransaction.getTransactionAmount())
                .transactionBalance(accountTransaction.getTransactionBalance())
                .transactionAccount(accountTransaction.getTransactionAccount())
                .transactionBankId(accountTransaction.getTransactionBankId())
                .transactionSuccessTime(accountTransaction.getTransactionDate())
                .build();
    }
}
