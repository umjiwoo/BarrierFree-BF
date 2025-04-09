package com.blindfintech.domain.transaction.dto;

import lombok.Getter;

@Getter
public class PaymentRequestDto {
    private Long userId;
    private String transactionWebSocketId;
    private String sellerAccountNo;
    private String sellerAccountBankCode;
    private Integer transactionAmount;
}
