package com.blindfintech.domain.transction.entity;

import com.blindfintech.domain.users.entity.User;
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
@Table(name = "transaction_history")
public class TransactionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_history_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 32)
    @NotNull
    @Column(name = "transaction_account", nullable = false, length = 32)
    private String transactionAccount;

    @NotNull
    @Column(name = "transaction_bank_id", nullable = false)
    private Integer transactionBankId;

    @Size(max = 32)
    @NotNull
    @Column(name = "transaction_name", nullable = false, length = 32)
    private String transactionName;

    @NotNull
    @Column(name = "last_transaction", nullable = false)
    private Instant lastTransaction;

}