package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.bank.Repository.BankRepository;
import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.transction.entity.AccountTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@AllArgsConstructor
@Getter
@Builder
public class TransactionResultDto {
    private Integer id;
    private String transactionName;
    private Integer transactionAmount;
    private Integer transactionBalance;
    private Instant transactionDate;
    private String transactionAccount;
    private Integer transactionBankId;

    public static TransactionResultDto from(AccountTransaction accountTransaction) {
        return TransactionResultDto.builder()
                .id(accountTransaction.getId())
                .transactionName(accountTransaction.getTransactionName())
                .transactionAmount(accountTransaction.getTransactionAmount())
                .transactionBalance(accountTransaction.getTransactionBalance())
                .transactionDate(accountTransaction.getTransactionDate())
                .transactionAccount(accountTransaction.getTransactionAccount())
                .transactionBankId(accountTransaction.getTransactionBankId())
                .build();
    }
}
