package com.blindfintech.domain.transction.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.transction.dto.TransactionDto;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.ACCOUNT_NOT_FOUND;
import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.INSUFFICIENT_BALANCE;

@AllArgsConstructor
@Service
public class TransactionProcessor {
    private final AccountRepository accountRepository;
    private final TransactionLogRepository transactionLogRepository;

    @Transactional
    public void performSendMoneyTransaction(TransactionDto transactionDto, String transactionUuid) {
        TransactionLog transactionLog = null;
        long sendAmount = (long)transactionDto.getAmount();

        // 1. 보내는 계좌 amount 차액
        updateSenderBalance(transactionDto.getSenderAccountId(), sendAmount, transactionUuid);

        transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_COMPLETED));
        transactionLogRepository.save(transactionLog);

        // 2. 받는 계좌 amount 증액
        updateReceiverBalance(transactionDto.getReceiverAccountId(), sendAmount, transactionUuid);

        transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_COMPLETED));
        transactionLogRepository.save(transactionLog);
    }

    private void updateSenderBalance(int senderAccountId, long sendAmount, String transactionUuid) {
        Account sender = accountRepository.findAccountByIdWithLock(senderAccountId)
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Long senderAccountBalance = sender.getAccountBalance();

        if (senderAccountBalance.compareTo(sendAmount) < 0) {
            // TransactionLog 데이터 생성 - WITHDRAW_FAILED
            TransactionLog transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_FAILED));
            transactionLogRepository.save(transactionLog);

            throw new BadRequestException(INSUFFICIENT_BALANCE);
        }

        sender.setAccountBalance(senderAccountBalance - sendAmount);
    }

    private void updateReceiverBalance(int receiverAccountId, long sendAmount, String transactionUuid) {
        TransactionLog transactionLog = null;

        Account receiver = accountRepository.findAccountByIdWithLock(receiverAccountId)
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Long receiverAccountBalance = receiver.getAccountBalance();
        receiver.setAccountBalance(receiverAccountBalance + sendAmount);
    }
}
