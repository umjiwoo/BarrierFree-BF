package com.blindfintech.domain.transction.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.exception.BaseException;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.bank.Repository.BankRepository;
import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.transction.controller.request.CheckAccountRequest;
import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import com.blindfintech.domain.transction.dto.CheckAccountResultDto;
import com.blindfintech.domain.transction.dto.TransactionDto;
import com.blindfintech.domain.transction.dto.TransactionResultDto;
import com.blindfintech.domain.transction.entity.AccountTransaction;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.exception.TransactionExceptionCode;
import com.blindfintech.domain.transction.kafka.TransactionProducer;
import com.blindfintech.domain.transction.repository.AccountTransactionRepository;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class TransctionService {
    private final TransctionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BankRepository bankRepository;

    private final TransactionProducer producer;
    private final TransactionLogRepository transactionLogRepository;

    public CheckAccountResultDto checkAccount(CheckAccountRequest checkAccountRequest) {
        Account account = accountRepository.findAccountByAccountNo(
                checkAccountRequest.getTransactionAccountNumber())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Bank accountBank = bankRepository.findBankById(account.getBankId());
        if(accountBank.getBankCode().equals(checkAccountRequest.getTransactionAccountBankCode())){
            return CheckAccountResultDto.from(
                    account.getId(),
                    checkAccountRequest.getTransactionAccountNumber(),
                    checkAccountRequest.getTransactionAccountBankCode(),
                    account.getUsername()
            );
        }else{
            throw new BadRequestException(TransactionExceptionCode.ACCOUNT_NOT_FOUND);
        }
    }

    public void produceSendMoney(TransactionRequest transactionRequest) {
        // 보내는 사람의 계좌 잔액 확인
        Account sender = accountRepository.findAccountById(transactionRequest.getSenderAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        // 잔액이 송금 가능한 금액이 아닌 경우
        if(transactionRequest.getTransactionAmount() > sender.getAccountBalance()){
            throw new BaseException(INSUFFICIENT_BALANCE);
        }

        // 메시지 발행
        // 1. TransactionDto로 변경
        TransactionDto transactionData = TransactionDto.from(transactionRequest);

        // 2. Producer 이용해 메시지 전송
        producer.sendTransaction(transactionData);
    }

    @Async
    public TransactionResultDto consumeSendMoney(TransactionDto transactionDto, String transactionUuid){
        log.info("🟢 Received TransactionDto: {}", transactionDto.toString());

        // 메시지 처리
        Long sendAmount = transactionDto.getAmount();
        TransactionLog transactionLog = null;

        // 1. 보내는 계좌 amount 차액
        Account sender = accountRepository.findByIdWithLock(transactionDto.getSenderAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Long senderAccountBalance = sender.getAccountBalance();

        if (senderAccountBalance.compareTo(sendAmount) < 0) {
            // TransactionLog 데이터 생성 - WITHDRAW_FAILED
            transactionLog = TransactionLog.from(
                    TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_FAILED));
            transactionLogRepository.save(transactionLog);
        }

        sender.setAccountBalance(senderAccountBalance - sendAmount);

        transactionLog = TransactionLog.from(
                TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_COMPLETED));
        transactionLogRepository.save(transactionLog);

        // 2. 받는 계좌 amount 증액
        Account receiver = accountRepository.findByIdWithLock(transactionDto.getReceiverAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Long receiverAccountBalance = receiver.getAccountBalance();
        receiver.setAccountBalance(receiverAccountBalance - sendAmount);

        transactionLog = TransactionLog.from(
                TransactionLogDto.from(transactionUuid, TransactionState.WITHDRAW_COMPLETED));
        transactionLogRepository.save(transactionLog);

        // TODO TransactionLog 땡기기 - 웹소켓 이용?

        // TransactoinLog 가 Completed인 경우 AccountTransaction 생성
        // TODO 송금인, 수신인 둘 다 생성돼야 함
        AccountTransaction accountTransaction = new AccountTransaction();
//        accountTransaction.setId();
//        accountTransaction.setAccount();

        // TODO 최근 거래 계좌 내역을 저장하는 TransactionHistory 테이블 데이터 생성
        return TransactionResultDto.from(accountTransaction);
    }
}
