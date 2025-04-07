package com.blindfintech.domain.transction.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "transaction_log")
public class TransactionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_log_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "transaction_uuid", nullable = false)
    private String transactionUuid;

    @NotNull
    @Lob
    @Column(name = "transaction_state", nullable = false)
    private String transactionState;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

}