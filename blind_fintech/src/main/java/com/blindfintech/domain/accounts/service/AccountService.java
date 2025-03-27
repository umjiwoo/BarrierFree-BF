package com.blindfintech.domain.accounts.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.accounts.constants.BranchCode;
import com.blindfintech.domain.accounts.constants.ProductCode;
import com.blindfintech.domain.accounts.dto.*;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.accounts.repository.AccountTransactionRepository;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.blindfintech.domain.accounts.exception.AccountExceptionCode.*;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final UserService userService;
    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final PasswordEncoder passwordEncoder;

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
    public String createAccount(AccountInputDto accountInputDto) {
        String password = accountInputDto.getAccountPassword();
        if (!StringUtils.isNumeric(password)
                || 0 > Integer.parseInt(password)
                || Integer.parseInt(password) >= 10000) {
            throw new BadRequestException(PASSWORD_ERROR);
        }

        Optional<User> user = userService.getCurrentUser();
        String newAccountNo = generateAccountNumber(user.get().getPhoneNumber());
        if (accountRepository.existsByAccountNo(newAccountNo)) {
            throw new BadRequestException(ACCOUNT_ALREADY_EXISTS);
        }

        String encodedPassword = passwordEncoder.encode(accountInputDto.getAccountPassword());

        Account account = Account.builder()
                .user(user.get())
                .accountNo(newAccountNo)
                .username(accountInputDto.getUsername() != null && !accountInputDto.getUsername().equals("") ? accountInputDto.getUsername(): user.get().getUserName())
                .dailyTransferLimit(accountInputDto.getDailyTransferLimit())
                .oneTimeTransferLimit(accountInputDto.getOneTimeTransferLimit())
                .accountPassword(encodedPassword)
                .build();
        this.accountRepository.save(account);

        return newAccountNo;
    }

    public String getAccountState(int accountId) {
        String accountState = accountRepository.findAccountStateById(accountId);
        return accountState;
    }

    public static String generateAccountNumber(String phoneNumber) {
        StringBuilder accountNumber = new StringBuilder();

        accountNumber.append(BranchCode.ONLINE.getCode());

        accountNumber.append(ProductCode.REGULAR_DEPOSIT.getCode());

        accountNumber.append(phoneNumber);

        return accountNumber.toString();
    }
}
