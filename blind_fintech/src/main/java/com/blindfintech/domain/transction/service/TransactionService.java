package com.blindfintech.domain.transction.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.exception.BaseException;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.accounts.repository.AccountTransactionRepository;
import com.blindfintech.domain.bank.Repository.BankRepository;
import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.transction.config.handler.TransactionWebSocketHandler;
import com.blindfintech.domain.transction.controller.request.CheckAccountRequest;
import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import com.blindfintech.domain.transction.dto.CheckAccountResultDto;
import com.blindfintech.domain.transction.dto.TransactionDto;
import com.blindfintech.domain.transction.dto.TransactionResultDto;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.exception.TransactionExceptionCode;
import com.blindfintech.domain.transction.kafka.TransactionProducer;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import jakarta.transaction.Transactional;
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

        // 메시지 발행
        // 1. TransactionDto로 변경
        TransactionDto transactionData = TransactionDto.from(transactionRequest);

        // 2. Producer 이용해 메시지 전송
        producer.sendTransaction(transactionData);
    }

    @Async
    public void consumeSendMoney(TransactionDto transactionDto, String transactionUuid){
        log.info("🟢 Received TransactionDto: {}", transactionDto.toString());

        // 메시지 처리
        try {
            transactionProcessor.performSendMoneyTransaction(transactionDto, transactionUuid);

            try{
                // websocket을 통한 응답
                transactionWebSocketHandler.sendTransactionResult(transactionUuid, "송금 성공! Transaction ID: " + transactionUuid);
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
