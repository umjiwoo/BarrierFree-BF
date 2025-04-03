package com.blindfintech.domain.transction.service;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.exception.ExceptionResponse;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.bank.Repository.BankRepository;
import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.transction.config.handler.TransactionWebSocketHandler;
import com.blindfintech.domain.transction.controller.request.CheckAccountRequest;
import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import com.blindfintech.domain.transction.dto.CheckAccountResultDto;
import com.blindfintech.domain.transction.dto.TransactionResponseDto;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.exception.TransactionExceptionCode;
import com.blindfintech.domain.transction.kafka.TransactionProducer;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import static com.blindfintech.domain.transction.exception.TransactionExceptionCode.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class TransactionService {
    private final ObjectMapper objectMapper;
    private final AccountRepository accountRepository;
    private final BankRepository bankRepository;

    private final TransactionProducer producer;
    private final TransactionProcessor transactionProcessor;
    private final TransactionLogRepository transactionLogRepository;

    private final TransactionWebSocketHandler transactionWebSocketHandler;

    public CheckAccountResultDto checkAccount(CheckAccountRequest checkAccountRequest) {
        Account account = accountRepository.findAccountByAccountNo(
                checkAccountRequest.getTransactionAccountNumber())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Bank accountBank = bankRepository.findBankById(account.getBankId());
        if(accountBank.getBankCode().equals(checkAccountRequest.getTransactionAccountBankCode())){
            return CheckAccountResultDto.from(account.getId(), account.getUsername());
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
            throw new BadRequestException(INSUFFICIENT_BALANCE);
        }

        // daily_transfer_limit, one_time_transfer_limit 확인
        if(transactionRequest.getTransactionAmount() > sender.getOneTimeTransferLimit()){
            throw new BadRequestException(OVER_ONETIME_TRANSFER_LIMIT);
        }

        // TODO 1일 이체한도 초과 여부 확인
        if(transactionRequest.getTransactionAmount() > sender.getDailyTransferLimit()){
            throw new BadRequestException(OVER_DAILY_TRANSFER_LIMIT);
        }

        // 메시지 발행
        producer.sendTransaction(transactionRequest);
    }

    @Async
    public void consumeSendMoney(TransactionRequest transactionRequest, String transactionUuid){
        log.info("🟢 Received TransactionRequest: {}", transactionRequest.toString());

        // 메시지 처리
        try {
            AccountTransaction senderAccountTransaction = transactionProcessor.performSendMoneyTransaction(transactionRequest, transactionUuid);

            try{
                // websocket을 통한 응답
                TransactionResponseDto transactionResponseDto = TransactionResponseDto.from(senderAccountTransaction);
                String transactionResponse = objectMapper.writeValueAsString(ResponseDto.success(transactionResponseDto));
                transactionWebSocketHandler.sendTransactionResult(transactionResponse);

                // TODO 입금 받은 유저에게 푸시 알림
            } catch (Exception e) {
                log.error("🔕WebSocket 응답 전송 실패: {}", e.getMessage());
                String transactionResponse = objectMapper.writeValueAsString(
                        ResponseDto.error(new ExceptionResponse(SOCKET_RESPONSE_FAILED.getCode(),
                                                                SOCKET_RESPONSE_FAILED.getMessage())));
                transactionWebSocketHandler.sendTransactionResult(transactionResponse);
            }
        }catch(Exception e){
            TransactionLog transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.FAILED));
            transactionLogRepository.save(transactionLog);

            try {
                String transactionResponse = objectMapper.writeValueAsString(
                        ResponseDto.error(new ExceptionResponse(SEND_MONEY_FAILED.getCode(), SEND_MONEY_FAILED.getMessage())));
                transactionWebSocketHandler.sendTransactionResult(transactionResponse);
            } catch (Exception ex) {
                log.error("🔕WebSocket 응답 전송 실패: {}", e.getMessage());
            }
        }
    }
}
