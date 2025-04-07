package com.blindfintech.domain.transction.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.transction.dto.*;
import com.blindfintech.domain.transction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    @GetMapping("/check-account")
    public ResponseEntity<ResponseDto<CheckAccountResultDto>> checkAccount(
            @RequestBody CheckAccountRequestDto accountInfo) {
        CheckAccountResultDto checkAccountResultDto= transactionService.checkAccount(accountInfo);
        return ResponseEntity.ok().body(ResponseDto.success(checkAccountResultDto));
    }

    @PostMapping("/send-money")
    public ResponseEntity<?> sendMoney(
            @RequestBody TransactionRequestDto transactionRequestDto){

        transactionService.produceSendMoney(transactionRequestDto);
        return ResponseEntity.ok().body(ResponseDto.success(null));
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

        // TODO push 알림 보내기
        // TODO 받을 사람 게좌 id/이름, transactionWebSocketId, transactionAmount 포함
//        if(checkAccount != null){
//            fcmService.sendPushNotification();
//        }

        return ResponseEntity.ok().body(ResponseDto.success(null));
    }

    @PostMapping("/accept-payment")
    public ResponseEntity<?> acceptPayment(
            @RequestBody TransactionRequestDto transactionRequestDto){
        // TODO 선택된 계좌, 비밀번호 매칭 확인
        transactionService.produceSendMoney(transactionRequestDto);

        return ResponseEntity.ok().body(ResponseDto.success(null));
    }

    @GetMapping("/buyer-info")
    public ResponseEntity<ResponseDto<BuyerInfoDto>> getBuyerInfo(){
        BuyerInfoDto buyerInfoDto = transactionService.getBuyerInfo();
        return ResponseEntity.ok().body(ResponseDto.success(buyerInfoDto));
    }
}
