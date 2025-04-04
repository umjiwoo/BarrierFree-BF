package com.blindfintech.domain.transction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class TransactionRequestDto {
    private Integer senderAccountId;
    private Integer receiverAccountId;
    private Integer transactionAmount;
    private String transactionName;
    private String transactionWebSocketId;
}
