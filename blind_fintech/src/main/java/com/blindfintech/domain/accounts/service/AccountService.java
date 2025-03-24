package com.blindfintech.domain.accounts.service;

import com.blindfintech.domain.accounts.dto.AccountDetailsDto;
import com.blindfintech.domain.accounts.dto.AccountDetailsProjection;
import com.blindfintech.domain.accounts.dto.AccountListDto;
import com.blindfintech.domain.accounts.dto.AccountProjection;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.accounts.repository.AccountTransactionRepository;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final UserService userService;
    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;

    public AccountListDto getAccounts() {
        Optional<User> user = userService.getCurrentUser();
        List<AccountProjection> accounts = accountRepository.findAllByUser(user.get());
        return AccountListDto.builder().
                accounts(accounts).
                build();
    }

    public AccountDetailsDto getAccountDetails(int accountId) {
        List<AccountDetailsProjection> accountDetails = accountTransactionRepository.findByAccountId(accountId);
        return AccountDetailsDto.builder().
                accountDetails(accountDetails).
                build();
    }
}
