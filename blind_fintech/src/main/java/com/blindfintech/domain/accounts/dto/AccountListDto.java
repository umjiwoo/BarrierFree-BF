package com.blindfintech.domain.accounts.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AccountListDto {
    private List<AccountProjection> accounts;
}
