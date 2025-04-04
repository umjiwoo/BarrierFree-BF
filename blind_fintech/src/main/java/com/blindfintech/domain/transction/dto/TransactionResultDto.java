package com.blindfintech.domain.transction.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class TransactionResultDto {
    private Integer senderAccountId;
    private Integer receiverAccountId;
    private Integer amount;
    private String transactionName;
    private String transactionUuid;
    private LocalDateTime transactionCompletedTime;

    public static TransactionResultDto from(TransactionRequestDto transactionRequestDto, String transactionUuid, LocalDateTime transactionCompletedTime) {
        return TransactionResultDto.builder()
                .senderAccountId(transactionRequestDto.getSenderAccountId())
                .receiverAccountId(transactionRequestDto.getReceiverAccountId())
                .amount(transactionRequestDto.getTransactionAmount())
                .transactionName(transactionRequestDto.getTransactionName())
                .transactionUuid(transactionUuid)
                .transactionCompletedTime(transactionCompletedTime)
                .build();
    }
}
