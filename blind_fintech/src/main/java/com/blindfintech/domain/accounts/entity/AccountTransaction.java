package com.blindfintech.domain.accounts.entity;

import com.blindfintech.domain.transction.dto.TransactionResultDto;
import com.blindfintech.domain.transction.entity.TransactionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;

import java.time.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "account_transaction")
public class AccountTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @NotNull
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Size(max = 32)
    @NotNull
    @Column(name = "transaction_name", nullable = false, length = 32)
    private String transactionName;

    @NotNull
    @Column(name = "transaction_amount", nullable = false)
    private Integer transactionAmount;

    @NotNull
    @Column(name = "transaction_balance", nullable = false)
    private Long transactionBalance;

    @NotNull
    @CreatedDate
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Size(max = 32)
    @NotNull
    @Column(name = "transaction_account", nullable = false, length = 32)
    private String transactionAccount;

    @NotNull
    @Column(name = "transaction_bank_id", nullable = false)
    private Integer transactionBankId;

    @Size(max = 36)
    @NotNull
    @Column(name = "transaction_uuid", nullable = false, length = 36)
    private String transactionUuid;

    public static AccountTransaction from(Account myAccount, Account oppositeAccount,
                                          TransactionResultDto transactionResultDto, TransactionType transactionType) {
        return AccountTransaction.builder()
                .account(myAccount)
                .transactionType(transactionType)
                .transactionName(transactionResultDto.getTransactionName())
                .transactionAmount(transactionResultDto.getAmount())
                .transactionBalance(myAccount.getAccountBalance())
                .transactionDate(transactionResultDto.getTransactionCompletedTime())
                .transactionAccount(oppositeAccount.getAccountNo())
                .transactionBankId(oppositeAccount.getBankId())
                .transactionUuid(transactionResultDto.getTransactionUuid())
                .build();
    }
}