package com.blindfintech.domain.transction.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.transction.controller.request.CheckAccountRequest;
import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import com.blindfintech.domain.transction.dto.CheckAccountResultDto;
import com.blindfintech.domain.transction.dto.RecentTransactionAccountDto;
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

    @GetMapping("/check-account")
    public ResponseEntity<ResponseDto<CheckAccountResultDto>> checkAccount(
            @RequestBody CheckAccountRequest accountInfo) {
        CheckAccountResultDto checkAccountResultDto= transactionService.checkAccount(accountInfo);
        return ResponseEntity.ok().body(ResponseDto.success(checkAccountResultDto));
    }

    @PostMapping("/send-money")
    public ResponseEntity<?> sendMoney(
            @RequestBody TransactionRequest transactionRequest){

        transactionService.produceSendMoney(transactionRequest);
        return ResponseEntity.ok().body("ok");
    }

    @GetMapping("/history")
    public ResponseEntity<ResponseDto<List<RecentTransactionAccountDto>>> getTransactionHistory(){
        List<RecentTransactionAccountDto> recentTransactionAccounts = transactionService.getRecentTransactionAccounts();
        return ResponseEntity.ok(ResponseDto.success(recentTransactionAccounts));
    }
}
