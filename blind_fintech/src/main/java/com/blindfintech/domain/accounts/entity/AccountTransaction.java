package com.blindfintech.domain.accounts.entity;

import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.transction.entity.TransactionLog;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "account_transaction")
public class AccountTransaction {
    @Id
    @Column(name = "transaction_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "transaction_uuid", nullable = false, referencedColumnName = "transaction_uuid")
    private TransactionLog transactionUuid;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @NotNull
    @Lob
    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    @Size(max = 32)
    @NotNull
    @Column(name = "transaction_name", nullable = false, length = 32)
    private String transactionName;

    @NotNull
    @Column(name = "transaction_amount", nullable = false)
    private Integer transactionAmount;

    @NotNull
    @Column(name = "transaction_balance", nullable = false)
    private Integer transactionBalance;

    @NotNull
    @Column(name = "transaction_date", nullable = false)
    private Instant transactionDate;

    @Size(max = 32)
    @NotNull
    @Column(name = "transaction_account", nullable = false, length = 32)
    private String transactionAccount;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "transaction_bank_id", nullable = false)
    private Bank transactionBank;

    @NotNull
    @Column(name = "transaction_status", nullable = false)
    private Boolean transactionStatus = false;

}