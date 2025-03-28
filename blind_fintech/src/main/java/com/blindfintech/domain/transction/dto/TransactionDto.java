package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class TransactionDto {
    private Integer senderAccountId;
    private Integer receiverAccountId;
    private Integer amount;
    private String transactionName;
    private LocalDateTime timestamp;

    public static TransactionDto from(TransactionRequest transactionRequest) {
        return TransactionDto.builder()
                .senderAccountId(transactionRequest.getSenderAccountId())
                .receiverAccountId(transactionRequest.getReceiverAccountId()) // TODO 받는 사람 계좌 id 어떻게 넘길지 고민
                .amount(transactionRequest.getTransactionAmount())
                .transactionName(transactionRequest.getTransactionName())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
