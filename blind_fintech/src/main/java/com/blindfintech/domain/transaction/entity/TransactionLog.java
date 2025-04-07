package com.blindfintech.domain.transaction.entity;

import com.blindfintech.domain.transaction.dto.TransactionLogDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "transaction_log")
public class TransactionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_log_id", nullable = false)
    private Integer id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_state", nullable = false)
    private TransactionState transactionState;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Size(max = 36)
    @NotNull
    @Column(name = "transaction_uuid", nullable = false, length = 36)
    private String transactionUuid;

    public static TransactionLog from(TransactionLogDto transactionLogData) {
        return TransactionLog.builder()
                .transactionState(transactionLogData.getTransactionState())
                .transactionUuid(transactionLogData.getTransactionUuid())
                .createdAt(LocalDateTime.now())
                .build();
    }
}