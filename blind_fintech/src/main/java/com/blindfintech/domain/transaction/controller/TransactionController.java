package com.blindfintech.domain.transaction.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.common.exception.ExceptionResponse;
import com.blindfintech.domain.accounts.dto.IsCorrectPwdDto;
import com.blindfintech.domain.accounts.service.AccountService;
import com.blindfintech.domain.transaction.dto.*;
import com.blindfintech.domain.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.blindfintech.domain.accounts.exception.AccountExceptionCode.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    private final AccountService accountService;

    @PostMapping("/check-account")
    public ResponseEntity<ResponseDto<CheckAccountResultDto>> checkAccount(
            @RequestBody CheckAccountRequestDto accountInfo) {
        CheckAccountResultDto checkAccountResultDto= transactionService.checkAccount(accountInfo);
        return ResponseEntity.ok().body(ResponseDto.success(checkAccountResultDto));
    }

    @PostMapping("/send-money")
    public ResponseEntity<?> sendMoney(
            @RequestBody TransactionRequestDto transactionRequestDto){
        IsCorrectPwdDto passwordValidationCheck = accountService.validatePassword(
                transactionRequestDto.getSenderAccountId(),
                transactionRequestDto.getAccountPassword());

        if(passwordValidationCheck.isCorrect()) {
            transactionService.produceSendMoney(transactionRequestDto);

            return ResponseEntity.ok().body(ResponseDto.success(null));
        }else{
            return ResponseEntity.ok().body(ResponseDto.error(
                    new ExceptionResponse(
                            WRONG_PASSWORD.getCode(),
                            WRONG_PASSWORD.getMessage())));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ResponseDto<List<RecentTransactionAccountDto>>> getTransactionHistory(){
        List<RecentTransactionAccountDto> recentTransactionAccounts = transactionService.getRecentTransactionAccounts();
        return ResponseEntity.ok(ResponseDto.success(recentTransactionAccounts));
    }

    @PostMapping("/request-payment")
    public ResponseEntity<?> requestPayment(@RequestBody PaymentRequestDto paymentRequest){
        // push 알림 전 계좌 유무 확인
        CheckAccountResultDto checkAccount = transactionService.checkAccount(
                CheckAccountRequestDto.from(paymentRequest));

        if(checkAccount != null) {
            transactionService.sendNotification(
                    PushMessageDto.from(checkAccount, paymentRequest));
        }

        return ResponseEntity.ok().body(ResponseDto.success(null));
    }

    @PostMapping("/accept-payment")
    public ResponseEntity<?> acceptPayment(
            @RequestBody TransactionRequestDto transactionRequestDto){
        IsCorrectPwdDto passwordValidationCheck = accountService.validatePassword(
                transactionRequestDto.getSenderAccountId(),
                transactionRequestDto.getAccountPassword());

        if(passwordValidationCheck.isCorrect()) {
            transactionService.produceSendMoney(transactionRequestDto);

            return ResponseEntity.ok().body(ResponseDto.success(null));
        }else{
            return ResponseEntity.ok().body(ResponseDto.error(
                    new ExceptionResponse(
                            WRONG_PASSWORD.getCode(),
                            WRONG_PASSWORD.getMessage())));
        }
    }

    @GetMapping("/buyer-info")
    public ResponseEntity<ResponseDto<BuyerInfoDto>> getBuyerInfo(){
        BuyerInfoDto buyerInfoDto = transactionService.getBuyerInfo();
        return ResponseEntity.ok().body(ResponseDto.success(buyerInfoDto));
    }
}
