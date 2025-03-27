package com.blindfintech.domain.accounts.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountInputDto {
    private String username;
    private Integer dailyTransferLimit;
    private Integer oneTimeTransferLimit;
    private String accountPassword;
}
