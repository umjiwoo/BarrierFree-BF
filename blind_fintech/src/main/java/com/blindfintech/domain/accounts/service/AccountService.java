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
import java.util.Random;

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
                .accountNo(generateAccountNumber())
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

    public static String generateAccountNumber() {
        Random random = new Random();

        // 앞 3자리
        String part1 = String.format("%03d", random.nextInt(1000));

        // 가운데 4자리
        String part2 = String.format("%04d", random.nextInt(10000));

        // 뒤 4자리
        String part3 = String.format("%04d", random.nextInt(10000));

        // 3자리-4자리-4자리 형식으로 반환
        return part1 + "-" + part2 + "-" + part3;
    }
}
