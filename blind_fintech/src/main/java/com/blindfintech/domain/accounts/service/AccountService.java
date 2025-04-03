package com.blindfintech.domain.accounts.service;

import com.blindfintech.common.ai.OpenAiClient;
import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.service.SmsService;
import com.blindfintech.domain.accounts.constants.BranchCode;
import com.blindfintech.domain.accounts.constants.ProductCode;
import com.blindfintech.domain.accounts.dto.*;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
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
                .username(accountInputDto.getUsername() != null && !accountInputDto.getUsername().isEmpty()
                        ? accountInputDto.getUsername(): user.getUsername())
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

    public List<AccountTransaction> aiSearchAccountTransaction(Integer accountNo, String input) {

        String prompt = "사용자의 요청에 따라 MySQL 쿼리를 생성하세요.  \n" +
                "- 테이블 이름: account_transaction  \n" +
                "- 주요 컬럼: transaction_name (거래명), transaction_type (거래 유형: 'DEPOSIT', 'WITHDRAWAL'), transaction_date (거래 날짜), transaction_amount (거래 금액)  \n" +
                "- 날짜 관련 요청이 있으면, 현재 날짜 기준으로 계산하여 적절한 `INTERVAL`을 사용하세요.  \n" +
                "- 특정 거래명을 포함하는 내역을 찾을 때는 `LIKE '%검색어%'`를 사용.  \n" +
                "- 사용자가 '최근'이라고 요청하면 가장 최신 거래 1건만 조회해야 하며, `ORDER BY transaction_date DESC LIMIT 1`을 사용하세요.  \n" +
                "- 반드시 `WHERE account_id = " + accountNo + "` 조건 포함.  \n" +
                "- 결과는 SQL 쿼리만 출력, 다른 설명은 하지 마세요.";
        String sqlQuery = openAiClient.sendRequest(prompt, input);
//        AccountTransactionRepository.findAiAccountTransactioon(Optional<AccountProjection>)
        return accountTransactionRepository.findTransactionsByQuery(sqlQuery);
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
