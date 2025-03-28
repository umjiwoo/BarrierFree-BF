package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.accounts.entity.AccountTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Builder
public class TransactionResultDto {
    private Integer id;
    private String transactionName;
    private Integer transactionAmount;
    private Long transactionBalance;
    private LocalDateTime transactionDate;
    private String transactionAccount;
    private Integer transactionBankId;

    public static TransactionResultDto from(AccountTransaction accountTransaction) {
        return TransactionResultDto.builder()
                .id(accountTransaction.getId())
                .transactionName(accountTransaction.getTransactionName())
                .transactionAmount(accountTransaction.getTransactionAmount())
                .transactionBalance(accountTransaction.getTransactionBalance())
                .transactionAccount(accountTransaction.getTransactionAccount())
                .transactionBankId(accountTransaction.getTransactionBankId())
                .build();
    }
}
