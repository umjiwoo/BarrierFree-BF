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
import com.blindfintech.domain.transction.dto.TransactionResultDto;
import com.blindfintech.domain.transction.entity.AccountTransaction;
import com.blindfintech.domain.transction.exception.TransactionExceptionCode;
import com.blindfintech.domain.transction.repository.TransctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.*;

@RequiredArgsConstructor
@Service
public class TransctionService {
    private final TransctionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BankRepository bankRepository;

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

    public TransactionResultDto sendMoney(TransactionRequest transactionRequest){
        // 보내는 사람의 계좌 잔액 확인
        Account account = accountRepository.findAccountById(transactionRequest.getSenderAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        // 잔액이 송금 가능한 금액이 아닌 경우
        if(transactionRequest.getTransactionAmount() > account.getAccountBalance()){
            throw new BaseException(INSUFFICIENT_BALANCE);
        }

        // 잔액이 송금 가능한 경우
        // 메시지 삽입


        // 메시지 받아오기

        // 메시지 처리

        // 처리 과정 TransactionLog에 기록

        // TransactionLog 땡기기

        // TransactoinLog 가 Completed인 경우 AccountTransaction 생성

        // 최근 거래 계좌 내역을 저장하는 TransactionHistory 테이블 데이터 생성

        AccountTransaction accountTransaction = new AccountTransaction();
//        accountTransaction.setId();
//        accountTransaction.setAccount();
        return TransactionResultDto.from(accountTransaction);
    }
}
