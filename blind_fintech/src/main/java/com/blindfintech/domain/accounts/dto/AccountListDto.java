package com.blindfintech.domain.accounts.dto;

import com.blindfintech.domain.accounts.entity.Account;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AccountListDto {
    private List<Account> accounts;
}
