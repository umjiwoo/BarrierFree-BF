package com.blindfintech.domain.accounts.service;

import com.blindfintech.common.ai.OpenAiClient;
import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.service.SmsService;
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
    private final SmsService smsService;
    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountListDto getAccounts() {
        User user = userService.getCurrentUser();
        List<AccountProjection> accounts = accountRepository.findAllByUser(user);
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

        User user = userService.getCurrentUser();
        String newAccountNo = generateAccountNumber(user.getPhoneNumber());
        if (accountRepository.existsByAccountNo(newAccountNo)) {
            throw new BadRequestException(ACCOUNT_ALREADY_EXISTS);
        }

        String encodedPassword = passwordEncoder.encode(accountInputDto.getAccountPassword());

        Account account = Account.builder()
                .user(user)
                .accountNo(newAccountNo)
                .username(accountInputDto.getUsername() != null && !accountInputDto.getUsername().equals("") ? accountInputDto.getUsername(): user.getUsername())
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

    private final OpenAiClient openAiClient;

    public String aiSearchAccountTransaction(Integer accountNo, String input) {

        String prompt = "Search Account";
        System.out.println("openAi");
//        AccountTransactionRepository.findAiAccountTransactioon(Optional<AccountProjection>)
        return openAiClient.sendRequest(prompt, input);
    }


    @Transactional
    public IsCorrectPwdDto validatePassword(int account_id, String accountPassword) {
        Account account = accountRepository.findAccountById(account_id);
        int failedAttempts = account.getFailedAttempts();

        boolean isLocked = false;
        boolean isCorrect = false;

        if (failedAttempts < 5) {
            String correctPassword = account.getAccountPassword();
            isCorrect = passwordEncoder.matches(accountPassword, correctPassword);

            if (!isCorrect) {
                failedAttempts = account.failedPassword();

                if (failedAttempts >= 5) {
                    account.lockAccount();
                    isLocked = true;
                }
            }
        } else {
            isLocked = true;
        }
        return IsCorrectPwdDto.builder()
                .isCorrect(isCorrect)
                .isLocked(isLocked).build();
    }

    @Transactional
    public void unlockAccount(int account_id, String phoneNumber, String verificationCode) {
        smsService.verifyCode(phoneNumber, verificationCode);
        Account account = accountRepository.findAccountById(account_id);
        account.unlockAccount();
    }
}
