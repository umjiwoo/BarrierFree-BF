package com.blindfintech.domain.transction.service;

import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.Transaction;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionLogDto {
    private TransactionState transactionState;
    private String transactionUuid;

    public static TransactionLogDto from(String transactionUuid, TransactionState transactionState) {
        return TransactionLogDto.builder()
                .transactionUuid(transactionUuid)
                .transactionState(transactionState)
                .build();
    }
}
