package com.blindfintech.domain.transction.controller.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class TransactionRequest {
    private Integer senderAccountId;
    private Integer receiverAccountId;
    private Integer transactionAmount;
    private String transactionName;
    private String transactionWebSocketId;
}
