package com.blindfintech.domain.transction.controller.request;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class CheckAccountRequest {
    private String transactionAccountNumber;
    private String transactionAccountBankCode;
}
