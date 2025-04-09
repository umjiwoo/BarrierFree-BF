package com.blindfintech.domain.transaction.dto;

import lombok.*;

@AllArgsConstructor
@Getter
@Setter
public class TransactionRequestDto {
    private Integer senderAccountId;
    private Integer receiverAccountId;
    private Integer transactionAmount;
    private String transactionName;
    private String transactionWebSocketId;
    private String accountPassword;
}
