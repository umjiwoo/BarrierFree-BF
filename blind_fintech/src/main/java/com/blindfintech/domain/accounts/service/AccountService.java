package com.blindfintech.domain.accounts.service;

import com.blindfintech.domain.accounts.dto.*;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.accounts.repository.AccountTransactionRepository;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import jakarta.transaction.Transactional;
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

    @Transactional
    public Account createAccount(AccountInputDto accountInputDto) {
        Optional<User> user = userService.getCurrentUser();
        Account account = Account.builder()
                .user(user.get())
                .accountNo(null)
                .username(accountInputDto.getUsername() != null ? accountInputDto.getUsername(): user.get().getUserName())
                .dailyTransferLimit(accountInputDto.getDailyTransferLimit())
                .oneTimeTransferLimit(accountInputDto.getOneTimeTransferLimit())
                .accountPassword(accountInputDto.getAccountPassword())
                .build();
        this.accountRepository.save(account);

        return account;
    }

    public String getAccountState(int accountId) {
        String accountState = accountRepository.findAccountStateById(accountId);
        return accountState;
    }
}
