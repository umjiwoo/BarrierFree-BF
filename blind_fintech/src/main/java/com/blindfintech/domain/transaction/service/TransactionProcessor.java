package com.blindfintech.domain.transaction.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.accounts.repository.AccountTransactionRepository;
import com.blindfintech.domain.transaction.dto.TransactionLogDto;
import com.blindfintech.domain.transaction.dto.TransactionRequestDto;
import com.blindfintech.domain.transaction.dto.TransactionResultDto;
import com.blindfintech.domain.transaction.entity.TransactionHistory;
import com.blindfintech.domain.transaction.entity.TransactionLog;
import com.blindfintech.domain.transaction.entity.TransactionState;
import com.blindfintech.domain.transaction.entity.TransactionType;
import com.blindfintech.domain.transaction.repository.TransactionHistoryRepository;
import com.blindfintech.domain.transaction.repository.TransactionLogRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.ACCOUNT_NOT_FOUND;
import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.INSUFFICIENT_BALANCE;

@Slf4j
@AllArgsConstructor
@Service
public class TransactionProcessor {
    private final AccountRepository accountRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    @Transactional
    public AccountTransaction performSendMoneyTransaction(TransactionRequestDto transactionRequestDto, String transactionUuid) {
        TransactionLog transactionLog = null;
        long sendAmount = (long) transactionRequestDto.getTransactionAmount();

        Account sender = accountRepository.findAccountById(transactionRequestDto.getSenderAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));
        Account receiver = accountRepository.findAccountById(transactionRequestDto.getReceiverAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        // 1. 보내는 계좌 amount 차액
        updateSenderBalance(sender, sendAmount, transactionUuid);

        transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_COMPLETED));
        transactionLogRepository.save(transactionLog);

        log.info("💲송금인 계좌 차액 완료");

        // 2. 받는 계좌 amount 증액
        updateReceiverBalance(receiver, sendAmount, transactionUuid);

        transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.DEPOSIT_COMPLETED));
        transactionLogRepository.save(transactionLog);

        log.info("💲수취인 계좌 증액 완료");

        // 3. 송금한 유저, 입금 받은 유저 AccountTransaction 데이터 생성
        LocalDateTime transactionCompletedTime = transactionLog.getCreatedAt();
        TransactionResultDto transactionResultDto = TransactionResultDto.from(transactionRequestDto, transactionUuid, transactionCompletedTime);

        AccountTransaction senderAccountTransaction = AccountTransaction.from(sender, receiver, transactionResultDto, TransactionType.WITHDRAWAL);
        AccountTransaction receiverAccountTransaction = AccountTransaction.from(receiver, sender, transactionResultDto, TransactionType.DEPOSIT);
        accountTransactionRepository.save(senderAccountTransaction);
        accountTransactionRepository.save(receiverAccountTransaction);

        // 4. 송금한 유저 TransactionHistory 갱신
        transactionHistoryRepository.findTransactionHistoryByTransactionAccount(sender.getAccountNo())
                .ifPresentOrElse(
                        transactionHistory1 -> updateTransactionHistory(transactionHistory1, transactionCompletedTime),
                        () -> createTransactionHistory(sender, senderAccountTransaction));

        return senderAccountTransaction;
    }

    private void updateSenderBalance(Account sender, long sendAmount, String transactionUuid) {
        Long senderAccountBalance = sender.getAccountBalance();

        if (senderAccountBalance.compareTo(sendAmount) < 0) {
            // TransactionLog 데이터 생성 - WITHDRAW_FAILED
            TransactionLog transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_FAILED));
            transactionLogRepository.save(transactionLog);

            throw new BadRequestException(INSUFFICIENT_BALANCE);
        }

        sender.setAccountBalance(senderAccountBalance - sendAmount);
    }

    private void updateReceiverBalance(Account receiver, long sendAmount, String transactionUuid) {
        Long receiverAccountBalance = receiver.getAccountBalance();
        receiver.setAccountBalance(receiverAccountBalance + sendAmount);
    }

    private void updateTransactionHistory(TransactionHistory transactionHistory, LocalDateTime transactionCompletedTime) {
        transactionHistory.setLastTransaction(transactionCompletedTime);
    }

    private void createTransactionHistory(Account sender, AccountTransaction senderAccountTransaction) {
        transactionHistoryRepository.save(TransactionHistory.from(sender.getUser(), senderAccountTransaction));
    }
}
