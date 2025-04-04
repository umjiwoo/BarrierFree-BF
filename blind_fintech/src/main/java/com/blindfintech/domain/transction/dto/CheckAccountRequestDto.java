package com.blindfintech.domain.transction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Builder
public class CheckAccountRequestDto {
    private String transactionAccountNumber;
    private String transactionAccountBankCode;

    public static CheckAccountRequestDto from(PaymentRequestDto paymentRequestDto) {
        return CheckAccountRequestDto.builder()
                .transactionAccountNumber(paymentRequestDto.getSellerAccountNo())
                .transactionAccountBankCode(paymentRequestDto.getSellerAccountBankCode())
                .build();
    }
}
