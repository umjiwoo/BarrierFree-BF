package com.blindfintech.domain.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Builder
@Getter
@Setter
public class PushMessageDto {
    private Long senderId;
    private Integer receiverAccountId;
    private Integer transactionAmount;
    private String transactionName;
    private String transactionWebSocketId;

    public static PushMessageDto from(CheckAccountResultDto checkAccountResultDto, PaymentRequestDto paymentRequestDto) {
        return PushMessageDto.builder()
                .senderId(paymentRequestDto.getUserId())
                .receiverAccountId(checkAccountResultDto.getReceiverAccountId())
                .transactionAmount(paymentRequestDto.getTransactionAmount())
                .transactionName(checkAccountResultDto.getUsername())
                .transactionWebSocketId(paymentRequestDto.getTransactionWebSocketId())
                .build();
    }
}
