package com.blindfintech.domain.transaction.dto;

import com.blindfintech.domain.transaction.entity.TransactionState;
import lombok.*;

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
