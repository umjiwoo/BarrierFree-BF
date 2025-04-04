package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.transction.entity.TransactionState;
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
