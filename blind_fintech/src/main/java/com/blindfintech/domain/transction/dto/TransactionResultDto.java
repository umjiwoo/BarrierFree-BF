package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import lombok.*;

import java.time.LocalDate;
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

    public static TransactionResultDto from(TransactionRequest transactionRequest, String transactionUuid, LocalDateTime transactionCompletedTime) {
        return TransactionResultDto.builder()
                .senderAccountId(transactionRequest.getSenderAccountId())
                .receiverAccountId(transactionRequest.getReceiverAccountId())
                .amount(transactionRequest.getTransactionAmount())
                .transactionName(transactionRequest.getTransactionName())
                .transactionUuid(transactionUuid)
                .transactionCompletedTime(transactionCompletedTime)
                .build();
    }
}
