package com.blindfintech.domain.accounts.service;

import com.blindfintech.domain.accounts.dto.AccountListDto;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;

    public AccountListDto getAccounts(User user) {
        List<Account> accounts = accountRepository.findAllByUser(user);
        return AccountListDto.builder().
                accounts(accounts).
                build();
    }
}
