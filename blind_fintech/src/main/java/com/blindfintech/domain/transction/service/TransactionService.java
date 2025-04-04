package com.blindfintech.domain.transction.service;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.exception.ExceptionResponse;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.bank.Repository.BankRepository;
import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.transction.config.handler.RemittanceWebSocketHandler;
import com.blindfintech.domain.transction.dto.CheckAccountRequestDto;
import com.blindfintech.domain.transction.dto.TransactionRequestDto;
import com.blindfintech.domain.transction.dto.CheckAccountResultDto;
import com.blindfintech.domain.transction.dto.RecentTransactionAccountDto;
import com.blindfintech.domain.transction.dto.TransactionResponseDto;
import com.blindfintech.domain.transction.entity.TransactionHistory;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.exception.TransactionExceptionCode;
import com.blindfintech.domain.transction.kafka.TransactionProducer;
import com.blindfintech.domain.transction.repository.TransactionHistoryRepository;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    private final RemittanceWebSocketHandler remittanceWebSocketHandler;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final UserService userService;

    public CheckAccountResultDto checkAccount(CheckAccountRequestDto checkAccountRequestDto) {
        Account account = accountRepository.findAccountByAccountNo(
                checkAccountRequestDto.getTransactionAccountNumber())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        Bank accountBank = bankRepository.findBankById(account.getBankId());
        if(accountBank.getBankCode().equals(checkAccountRequestDto.getTransactionAccountBankCode())){
            return CheckAccountResultDto.from(account.getId(), account.getUsername());
        }else{
            throw new BadRequestException(TransactionExceptionCode.ACCOUNT_NOT_FOUND);
        }
    }

    public void produceSendMoney(TransactionRequestDto transactionRequestDto) {
        // 보내는 사람의 계좌 잔액 확인
        Account sender = accountRepository.findAccountById(transactionRequestDto.getSenderAccountId())
                .orElseThrow(() -> new BadRequestException(ACCOUNT_NOT_FOUND));

        // 잔액이 송금 가능한 금액이 아닌 경우
        if(transactionRequestDto.getTransactionAmount() > sender.getAccountBalance()){
            throw new BadRequestException(INSUFFICIENT_BALANCE);
        }

        // daily_transfer_limit, one_time_transfer_limit 확인
        if(transactionRequestDto.getTransactionAmount() > sender.getOneTimeTransferLimit()){
            throw new BadRequestException(OVER_ONETIME_TRANSFER_LIMIT);
        }

        // TODO 1일 이체한도 초과 여부 확인
        if(transactionRequestDto.getTransactionAmount() > sender.getDailyTransferLimit()){
            throw new BadRequestException(OVER_DAILY_TRANSFER_LIMIT);
        }

        // 메시지 발행
        producer.sendTransaction(transactionRequestDto);
    }

    @Async
    public void consumeSendMoney(TransactionRequestDto transactionRequestDto, String transactionUuid){
        log.info("🟢 Received TransactionRequest: {}", transactionRequestDto.toString());

        // 메시지 처리
        try {
            AccountTransaction senderAccountTransaction = transactionProcessor.performSendMoneyTransaction(transactionRequestDto, transactionUuid);

            try{
                // websocket을 통한 응답
                TransactionResponseDto transactionResponseDto = TransactionResponseDto.from(senderAccountTransaction);
                String transactionResponse = objectMapper.writeValueAsString(ResponseDto.success(transactionResponseDto));
                remittanceWebSocketHandler.sendTransactionResult(transactionRequestDto.getTransactionWebSocketId(), transactionResponse);
            } catch (Exception e) {
                log.error("🔕WebSocket 응답 전송 실패: {}", e.getMessage());
                String transactionResponse = objectMapper.writeValueAsString(
                        ResponseDto.error(new ExceptionResponse(SOCKET_RESPONSE_FAILED.getCode(),
                                                                SOCKET_RESPONSE_FAILED.getMessage())));
                remittanceWebSocketHandler.sendTransactionResult(transactionRequestDto.getTransactionWebSocketId(), transactionResponse);
            }
        }catch(Exception e){
            TransactionLog transactionLog = TransactionLog.from(TransactionLogDto.from(transactionUuid, TransactionState.FAILED));
            transactionLogRepository.save(transactionLog);

            try {
                String transactionResponse = objectMapper.writeValueAsString(
                        ResponseDto.error(new ExceptionResponse(SEND_MONEY_FAILED.getCode(), SEND_MONEY_FAILED.getMessage())));
                remittanceWebSocketHandler.sendTransactionResult(transactionRequestDto.getTransactionWebSocketId(), transactionResponse);
            } catch (Exception ex) {
                log.error("🔕WebSocket 응답 전송 실패: {}", e.getMessage());
            }
        }
    }

    public List<RecentTransactionAccountDto> getRecentTransactionAccounts(){
        User user = userService.getCurrentUser();
        log.info("userId: {}, username: {}", user.getId(), user.getUsername());
        List<TransactionHistory> transactionHistories = transactionHistoryRepository.findTransactionHistoriesByUser(user);

        return Optional.ofNullable(transactionHistories)
                .orElse(Collections.emptyList())
                .stream()
                .map(RecentTransactionAccountDto::of)
                .collect(Collectors.toList());
    }
}
