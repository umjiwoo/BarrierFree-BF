package com.blindfintech.domain.accounts.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AccountDetailsDto {
    private List<AccountDetailsProjection> accountDetails;
}
