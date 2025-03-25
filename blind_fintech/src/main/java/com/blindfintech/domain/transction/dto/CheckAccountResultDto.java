package com.blindfintech.domain.transction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;

@Builder
public class CheckAccountResultDto {
    private Integer accountId;
    private String accountNumber;
    private String accountBankCode;
    private String username;

    public static CheckAccountResultDto from(Integer accountId, String accountNumber, String accountBankCode, String username) {
        return CheckAccountResultDto.builder()
                .accountId(accountId)
                .accountNumber(accountNumber)
                .accountBankCode(accountBankCode)
                .username(username).build();
    }
}
